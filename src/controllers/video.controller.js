import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy="createAt", sortType="desc", userId } = req.query;

  // validation
  
  if (userId && !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  // pipeline data
  const pipeline =[]
  if(query){
    pipeline.push({
      $match:{
        title:{$regex : query, $options:"i"}
      }
    })
  }
  if(userId){
    pipeline.push({
      $match:{
        owner:mongoose.Types.ObjectId(userId)
      }
    })
  }
  pipeline.push({
    $sort: { [sortBy]: sortType === "asc"? 1 : -1 }
  })

  const options ={
    page:parseInt(page,10),
    limit:parseInt(limit,10),
  }
  const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), options)

  //validation
  if (!videos) {
    throw new ApiError(500, "Failed to fetch videos");
  }

  // return res
  return res
   .status(200)
   .json(new ApiResponse(200, "Videos fetched successfully", {
    totalPages: videos.totalPages,
    currentPage: videos.page,
    videos: videos.docs,
    totalDocs: videos.totalDocs,
    limit: videos.limit,
    page: videos.page,
    total: videos.total
   }));
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
  const { title, description } = req.body;
  const file = req.files
  //validation
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  //check for title and description
  if (!title && !description && !file) {
    throw new ApiError(400, "Title and description are required");
  }
  //upload image 
  let imageUrl
  if( file &&file.length > 0 ){
    imageUrl = await uploadOnCloudinary(file?.thumbnail[0]?.path)
    if(!imageUrl){
      throw new ApiError(400, "Failed to upload image to cloudinary")
    }
  }
  // update video object
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
        $set:{
            title,
            description,
            thumbnail: imageUrl 
        }
    },
    { new: true }
  )
  //validation
  if (!video) {
    throw new ApiError(500, "Failed to update video");
  }
  //return
  return res
  .status(200)
  .json(
    new ApiResponse(200, "Video updated successfully", video)
  )
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //validation
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  // delete video object
  const video = await Video.findByIdAndDelete(videoId);
  //validation
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  //return
  return res
   .status(200)
   .json(new ApiResponse(200, "Video deleted successfully", video));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const {isPublic} = req.body;
  //validation
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  // toggle publish status
  if(typeof isPublic!== 'boolean'){
    throw new ApiError(400, "Invalid publish status");
  }
  // update video object
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
        $set:{
            isPublic
        }
    },
    { new: true }
  )
  //validation
  if (!video) {
    throw new ApiError(500, "Failed to update video");
  }
  //return
  return res
  .status(200)
  .json(
    new ApiResponse(200, "Video status updated successfully", video)
  ) 
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
