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
    page:parseInt(page , 10),
    limit: parseInt(limit,10)
  }

});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const {content } = req.body;
  const userId = req.user?._id
  // validation error message
  if(!videoId || !isValidObjectId(videoId) || !content){
    throw new ApiError(400, "Invalid video id or content");
  }
  //create comment 
  const comment = new Comment({
    content,
    owner: userId,
    onVideo: videoId
  });
  const saved = await comment.save();
  if(!saved){
    throw new ApiError(500, "Failed to save comment");
  }
  //return 
  return res
  .status(200)
  .json(new ApiResponse(200, "comments posted in success", saved))
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
});

export { getVideoComments, addComment, updateComment, deleteComment };
