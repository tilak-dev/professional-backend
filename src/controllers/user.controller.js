import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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
  const { email, username, password } = req.body;
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
const logoutUser = asyncHandler(async (req, res) => {
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
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, true, { message: "User logged out" }));
});

//token refresh

const refreshToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body.refreshToken;

    //validation
    if (!incomingRefreshToken) {
      throw new ApiError(401, "No refresh token provided");
    }
    const decodedRefreshToken = jwt.verify(
      incomingRefreshToken,
      process.env.REPRESS_TOKEN_SECRET
    );

    // check if user exists
    const user = await User.findById(decodedRefreshToken?.id);
    if (!user) {
      throw new ApiError(404, "user not found");
    }

    //check refresh token
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Invalid refresh token axpired or used ");
    }
    // generate new tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    //res
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: user, accessToken, refreshToken },
          true,
          "user logged in"
        )
      );
  } catch (error) {
    throw new ApiError(500, "something went wrong while refreshing tokens");
  }
});

//change password
const changeUserPassword = asyncHandler(async (req, res) => {
  const userid = req.user?._id;
  const { oldPassword, newPassword } = req.body;
  //validation
  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "All fields are required");
  }
  //user
  if (!userid) {
    throw new ApiError(401, "Not authorized");
  }
  //check user
  const user = await User.findById(userid);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  //check password
  const isMatch = await user.isCorrectPassword(oldPassword);
  if (!isMatch) {
    throw new ApiError(401, "Incorrect old password");
  }
  //update password
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  //res
  return res
    .status(200)
    .json(new ApiResponse(200, {}, true, "password changed successfully"));
});

//currect user
const currentUser = asyncHandler(async (req, res) => {
  // const userId = req.user?.id
  // if(!userId){
  //   throw new ApiError(401, "Not authorized");
  // }
  // const user = await User.findById(userId)
  // if(!user){
  //   throw new ApiError(404, "User not found");
  // }
  // return res.status(200).json(new ApiResponse(200, user, true))

  const user = req.user;

  if (!user) {
    throw new ApiError(401, "Not authorized");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, user, true, "current user fetched successfully")
    );
});

//update user deatils ,,, don't update all things at one make seprate endpoints

const updateUserDetails = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { fullName, email } = req.body;
  //validation
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }
  //user
  if (!userId) {
    throw new ApiError(401, "Not authorized");
  }
  //check user and update
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  //return
  return res
    .status(200)
    .json(
      new ApiResponse(200, user, true, "user details updated successfully")
    );
});

//update user image
const uploadUserAvatar = asyncHandler(async () => {
  //logic for image upload here
  const avaterLocalPath = req.file?.path;
  //validation
  if (!avaterLocalPath) {
    throw new ApiError(400, "No image uploaded");
  }

  const avater = await uploadOnCloudinary(avaterLocalPath);
  //validation
  if (!avater) {
    throw new ApiError(500, "Failed to upload image to cloudinary");
  }
  const uploadedImage = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { avatar: avater.url } }, //we are using $set coz we wanna update selective avatar
    { new: true }
  ).select("-password");
  //validation
  if (!uploadUserAvatar) {
    throw new ApiError(404, "User not found");
  }
  //return

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        uploadedImage,
        true,
        "user avatar updated successfully"
      )
    );
});

//update user cover image

const uploadUserCover = asyncHandler(async () => {
  //logic for image upload here
  const coverLocalPath = req.file?.path;
  //validation
  if (!coverLocalPath) {
    throw new ApiError(400, "No image uploaded");
  }

  const cover = await uploadOnCloudinary(coverLocalPath);
  //validation
  if (!cover) {
    throw new ApiError(500, "Failed to upload image to cloudinary");
  }
  const uploadedImage = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: { coverImage: cover.url } }, //we are using $set coz we wanna update selective avatar
    { new: true }
  ).select("-password");
  //validation
  if (!uploadedImage) {
    throw new ApiError(404, "User not found");
  }
  //return

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        uploadedImage,
        true,
        "user cover image updated successfully"
      )
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  //validation
  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }
  //aggregation
  const channelValue = await User.aggregate([
    {
      $match: {
        username: username.trim().toLowerCase(),
      },
    }, // first pipe line
    {
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"channel",
        as:"subscribers"

      }
    },
    {
      $lookup:{
        from:"subscriptions",
        localField:"_id",
        foreignField:"subscriber",
        as:"subscribedTo"
      }
    },
    {
      $addFields:{
        subscribersCount:{
          $size:"$subscribers"
        }, 
        subscribedToCount:{
          $size:"$subscribedTo"
        },
        isSubcribed:{
          $cond:{
            // if:{$eq:["$_id", req.user?._id]},
            if:{$in:[req.user?._id, "$subscribers.subscriber"]},
            then:true,
            else:false
          }//learn
        }
      }
    },
    {
      $project:{
        username:1,
        avatar:1,
        subscribersCount:1,
        subscribedToCount:1,
        isSubcribed:1,
        coverImage:1,
        email:1,
        createdAt:1
      }
    }
  ]);
  //validation
  if (!channelValue?.length) {
    throw new ApiError(404, "User channel not found");
  }
  console.log("bhai chennel value",channelValue);

  //return
  return res
   .status(200)
   .json(new ApiResponse(200, channelValue[0], true, "User channel profile fetched successfully")); 


});
export {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  changeUserPassword,
  currentUser,
  updateUserDetails,
  uploadUserAvatar,
  uploadUserCover,
  getUserChannelProfile,
};
