import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;
  //validation
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  //validation
  if (!isValidObjectId(userId)) {
    throw new ApiError(401, "Not authorized");
  }
  //check if already exixts
  const liked = await Like.findOne({
    onVideo: videoId,
    likedBy: userId,
  });
  if (liked) {
    //delete like
    await Like.findByIdAndDelete(liked._id);
    return res
      .status(200)
      .json(new ApiResponse(200, "video disliked successfully", liked));
  }
  //create new like
  const newLike = new Like({
    onVideo: videoId,
    likedBy: userId,
  });
  await newLike.save();
  return res
   .status(200)
   .json(new ApiResponse(200, "video liked successfully", newLike));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user?._id;
  //validation
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }
  //validation
  if (!isValidObjectId(userId)) {
    throw new ApiError(401, "Not authorized");
  }
  //check if already exixts
  const liked = await Like.findOne({
    onComment: commentId,
    likedBy: userId,
  });
  if (liked) {
    //delete like
    await Like.findByIdAndDelete(liked._id);
    return res
      .status(200)
      .json(new ApiResponse(200, "comment disliked successfully", liked));
  }
  //create new like
  const newLike = new Like({
    onComment: commentId,
    likedBy: userId,
  });
  await newLike.save();
  return res
   .status(200)
   .json(new ApiResponse(200, "comment  liked successfully", newLike));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user?._id;
  //validation
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }
  //validation
  if (!isValidObjectId(userId)) {
    throw new ApiError(401, "Not authorized");
  }
  //check if already exixts
  const liked = await Like.findOne({
    onTweet: tweetId,
    likedBy: userId,
  });
  if (liked) {
    //delete like
    await Like.findByIdAndDelete(liked._id);
    return res
      .status(200)
      .json(new ApiResponse(200, "tweet disliked successfully", liked));
  }
  //create new like
  const newLike = new Like({
    onTweet: tweetId,
    likedBy: userId,
  });
  await newLike.save();
  return res
   .status(200)
   .json(new ApiResponse(200, "tweet liked successfully", newLike));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
