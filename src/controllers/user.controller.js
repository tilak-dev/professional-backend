import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

//algo / logic for registering

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  const { fullName, email, username, password } = req.body();
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
  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage[0]?.path
  console.log("bhai files from multer",req.files)
  //check for cover  image
  if(!avatarLocalPath){
    throw new ApiError(400, "Please upload avatar");
  }
  //upload them on cloudinary , avatar
  //create user object- db entry
  // remove password and token from res
  // validation of user created successfully
  // return res
});

export { registerUser };
