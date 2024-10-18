import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//algo / logic for registering

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  const { fullName, email, username, password } = req.body
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
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  console.log("bhai files from multer", req.files);
  //check for cover  image
  if (!avatarLocalPath) {
    throw new ApiError(400, "Please upload avatar");
  }
  //upload them on cloudinary , avatar
  const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);
  const uploadedCoverImage = await uploadOnCloudinary(coverImageLocalPath);
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
    coverImage: uploadedCoverImage?.secure_url || "",
  });
  // validation of user created successfully
  if (!user) {
    throw new ApiError(500, "Failed to create user");
  }
  // remove password and token from res
  const createdUser = await User.findById(user.id).select(
    "-password -refreshToken"
  );

  // return res
  return res
    .status(201)
    .json(new ApiResponse(200, user, true, "user created successfully"));
});

export { registerUser };
