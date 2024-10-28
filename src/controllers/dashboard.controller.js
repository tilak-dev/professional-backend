import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  // Validate userId
  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

});


const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { limit = 10, page = 1 } = req.query;
  // Validate userId and channelId
  if (!userId ||!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  // Get videos by channel owner
  const videos = await Video.find({ owner: userId })
   .sort({ createdAt: -1 })
   .limit(Number(limit))
   .skip(Number(page) * Number(limit) - Number(limit));

    // validation 
    if (!videos) {
    throw new ApiError(404, "No videos found for this channel");
  }
  // response
  res.status(200).json(new ApiResponse(200, "Videos fetched successfully", videos));
});



export { getChannelStats, getChannelVideos };
