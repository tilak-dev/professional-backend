import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    //validation
    if (!token) {
      throw new ApiError(401, "Not authenticated");
    }
    // decoded token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    console.log("decoded : " , decodedToken)

    //find user
    const user = await User.findById(decodedToken?.id).select(
      "-password -refreshToken"
    );
    if (!user) {
      // TODO : discussion fontend
      throw new ApiError(403, "Not authorized");
    }
    // if user found then attach to req
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Authentication failed", error);
  }
});
