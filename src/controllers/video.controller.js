import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const user = req.user;
  const files = req.files;
  //validate title and description
  if (!(title || description)) {
    throw new ApiError(400, "Title and description are required");
  }
  //validate files
  if (!files || files.length === 0) {
    throw new ApiError(400, "No video and thumbbail file uploaded");
  }
  // user id
  if (!user) {
    throw new ApiError(400, "Invalid user id");
  }
  const videoLocalPath = files?.videoFile[0]?.path;
  const thumbnailLocalPath = files?.thumbnail[0]?.path;

  //upload them on cloudinary
  const uploadedVideo = await uploadOnCloudinary(videoLocalPath);
  const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  //validation
  if (!uploadedVideo || !uploadThumbnail) {
    throw new ApiError(
      400,
      "Failed to upload video or thumbnail to cloudinary"
    );
  }

  // create video object
  const video = await Video.create({
    title,
    description,
    owner: user?._id,
    videoFile: uploadedVideo.url,
    thumbnail: uploadThumbnail.url,
    duration: uploadedVideo.duration,
  });

  //validation
  if (!video) {
    throw new ApiError(500, "Failed to create video");
  }
  //return
  return res
    .status(200)
    .json(new ApiResponse(200, "Video published successfully", video));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //validation
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  //aggregation
  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId), //creating new instance
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline:[
            {
                $project: {
                    _id: 1,
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                },
            }
        ]
      },
    },
    {
        $addFields: {
            owner: {
                $arrayElemAt: ["$owner", 0],
            }
        }
    }
  ]);

  //validation
  if (!video || video.length === 0) {
    throw new ApiError(404, "Video not found");
  }
  //return
  return res
   .status(200)
   .json(new ApiResponse(200, "Video fetched successfully", video));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
