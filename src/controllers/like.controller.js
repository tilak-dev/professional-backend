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
  const { videoId } = req.params;
  //validation error
  console.log("bhai video error ",videoId)
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  //get all likes for a video
  const likes = await Like.aggregate([
    {
      $match: {
        onVideo: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "likedByUser",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields:{
        totalLikes:{
          $size: "$likedByUser",
        }
      }
    }
  ]);
  //validation error
  if (!likes) {
    throw new ApiError(500, "Error getting likes for video");
  }
  //return likes for video
  return res.status(200).json(new ApiResponse(200, "Liked videos", likes[0]));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
