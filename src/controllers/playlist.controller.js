import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user?._id;
  //validation error
  if (!userId || !isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }
  if (!name || !description) {
    throw new ApiError(400, "Name and description are required");
  }
  //create playlist
  const playlist = await Playlist.create({
    name,
    description,
    owner: userId,
  });
  //validation error
  if (!playlist) {
    throw new ApiError(500, "Failed to create playlist");
  }
  //send response with playlist data
  res
    .status(201)
    .json(new ApiResponse(200, "playlist created in success", playlist));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  //logic
  // user data
  //playlist data
  //response
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (
    !playlistId ||
    !videoId ||
    !isValidObjectId(playlistId) ||
    !isValidObjectId(videoId)
  ) {
    throw new ApiError(400, "Invalid playlist or video id");
  }
  //adding video to playlist
  //check if playlist exists
  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId },
    { $push: { video: videoId } },
    { new: true }
  );
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  //return playlist
  res.status(200).json(new ApiResponse(200, "Video added to playlist successfully", playlist));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (
    !playlistId ||
    !videoId ||
    !isValidObjectId(playlistId) ||
    !isValidObjectId(videoId)
  ) {
    throw new ApiError(400, "Invalid playlist or video id");
  }
  //check if playlist exists
  const playlist = await Playlist.findOneAndUpdate(
    { _id: playlistId },
    { $pull: { video: videoId } },
    { new: true }
  );
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  //return playlist
  res.status(200).json(new ApiResponse(200, "Video removed from playlist successfully", playlist));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId ||!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  //find the playlist and remove it 
  const playlist = await Playlist.findByIdAndDelete(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  //send response
  res.status(200).json(new ApiResponse(200, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  if (!playlistId ||!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  //validation 
  if (!name && !description) {
    throw new ApiError(400, "Name and description are required");
  }
  //update playlist
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name,
        description,
      },
    },
    { new: true }
  );
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }
  //send response
  res.status(200).json(new ApiResponse(200, "Playlist updated successfully", playlist));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
