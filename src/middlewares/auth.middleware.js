import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async(req, _,next)=>{
try {
    const token = req.cookies?.accessToken || req.header("Authorization"?.replace("Bearer ", ""))
  
    //validation 
    if(!token){
      throw new Error(401,"Not authenticated")
    }
    // decoded token
    const decodedToken =jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
  
    //find user
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user){
      // TODO : discussion fontend 
      throw new Error(403,"Not authorized")
    }
    // if user found then attach to req
    req.user = user
    next()
} catch (error) {
  throw new ApiError(401, "Authentication failed", error)
}
})