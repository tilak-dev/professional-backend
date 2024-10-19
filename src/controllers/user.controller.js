import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//algo / logic for registering

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  const { fullName, email, username, password } = req.body;
  //validation
  if (
    [email, username, password, fullName].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // check if user exists : username and emails
  const exists = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (exists) {
    throw new ApiError(409, "Username or email already exists");
  }
  // check for image :avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req?.files &&
    Array.isArray(req?.files?.coverImage) &&
    req?.files?.coverImage?.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  } else {
    coverImageLocalPath = null;
  }

  console.log("bhai files from multer", req.files);
  //check for cover  image
  if (!avatarLocalPath) {
    throw new ApiError(400, "Please upload avatar");
  }
  //upload them on cloudinary , avatar
  const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
  if (!uploadedAvatar) {
    throw new ApiError(400, "Failed to upload avatar to cloudinary");
  }
  console.log("uploaded cover image");
  //create user object- db entry
  const user = await User.create({
    fullName,
    email,
    username: username.toLowerCase(),
    password,
    avatar: uploadedAvatar.url,
    coverImage: uploadedCoverImage?.secure_url,
  });
  // validation of user created successfully
  if (!user) {
    throw new ApiError(500, "Failed to create user");
  }
  // remove password and token from res
  const createdUser = await User.findById(user.id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }
  // return res
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, true, "user created successfully"));
});


const loginUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  const {email, username, password} = req.body;
  // validation
  if (!email && !username) {
    throw new ApiError(400, " username or email is required");
  }
  if (!password) {
    throw new ApiError(400, " password is required");
  }
  // check if user exits
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  // if user not found
  if (!user) {
    throw new ApiError(404, "user does not exits");
  }
  // check password
  const isMatch = await user.isCorrectPassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid password credentials");
  }
  // generate JWT token refresh and access token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  // cookie
  const loggedInUser = await User.find(user._id).select(
    "-password -refreshToken "
  ); // ye expensive ho jayega jyada daba query jyada ho gyi h , so avoid it
  const options = {
    httpOnly: true,
    secure: true,
  };

  //return
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        true,
        "user logged in"
      )
    );
});

// generate tokens
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "user not found");
    }
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    //save
    await user.save({ validateBeforeSave: false }); //learn about it
    return {
      accessToken,
      refreshToken,
    };
  } catch (error) {
    throw new ApiError(500, "something went wrong while generating tokens ");
  }
};

// logout user
const logoutUser = asyncHandler(async (req,res) => {
  //logout user logic
  const id = req.user._id;
  const user = await User.findByIdAndUpdate(
    id,
    {
      $set: { refreshToken: null },
    },
    { new: true }
  );
  //validate user
  if (!user) {
    throw new ApiError(404, "user not found");
  }
  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new ApiResponse(200,{},true,{ message: "User logged out" }));


});
export { registerUser, loginUser, logoutUser };
