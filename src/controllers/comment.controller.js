import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  //validation error message
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  //options
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
  //find video comments
  const comments = await Comment.aggregatePaginate(
    Comment.aggregate([
      {
        $match: {
          onVideo: new mongoose.Types.ObjectId(videoId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails",
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
        $sort: { createdAt: -1 },
      },
    ]),
    options
  );
  //validation
  if (!comments) {
    throw new ApiError(404, "Comments not found for the given video");
  }
  //return
  return res
   .status(200)
   .json(new ApiResponse(200, "Comments fetched successfully", comments.docs));
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user?._id;
  // validation error message
  if (!videoId || !isValidObjectId(videoId) || !content) {
    throw new ApiError(400, "Invalid video id or content");
  }
  //create comment
  const comment = new Comment({
    content,
    owner: userId,
    onVideo: videoId,
  });
  const saved = await comment.save();
  if (!saved) {
    throw new ApiError(500, "Failed to save comment");
  }
  //return
  return res
    .status(200)
    .json(new ApiResponse(200, "comments posted in success", saved));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  // validation error message
  if (!commentId || !isValidObjectId(commentId) || !content) {
    throw new ApiError(400, "Invalid comment id or content");
  }
  //find comment by id and update content
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content,
      },
    },
    { new: true }
  );
  if (!updatedComment) {
    throw new ApiError(404, "Comment not found");
  }
  //return
  return res
    .status(200)
    .json(new ApiResponse(200, "comments updated in success", updatedComment));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  // validation error message
  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id or content");
  }
  //find comment by id and update content
  const deletedComment = await Comment.findByIdAndDelete(commentId);
  if (!deletedComment) {
    throw new ApiError(404, "Comment not found");
  }
  //return
  return res
    .status(200)
    .json(new ApiResponse(200, "comment deleted in success", deletedComment));
});

export { getVideoComments, addComment, updateComment, deleteComment };
