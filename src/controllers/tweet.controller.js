import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    const userId = req.user?._id
    if(!userId ||!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }
    //validation 
    if(!content || content.trim() ===""){
      throw new ApiError(400, "Content is required")
    }

    const newTweet = await Tweet.create({
        content,
        owner: userId
    })
    //validation 
    if(!newTweet){
        throw new ApiError(500, "Failed to create tweet")
    }
    res.status(201).json(new ApiResponse(200,"tweet posted in success",{data: newTweet}))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    if(!userId ||!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user id")
    }
    const tweets = await Tweet.find({owner: userId})
    .populate("owner", ["username","email","avatar"])
    if(!tweets){
        throw new ApiError(500, "Failed to fetch tweets")
    }
    res.status(200).json(new ApiResponse(200,"tweets fetched successfully", tweets))
})

const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const {content} = req.body
    const userId = req.user?._id
    // validation
    if(!userId || !isValidObjectId(userId)){
      throw new ApiError(400, "Invalid user id")
    }
    if(!content || content.trim() ==="" || !tweetId){
      throw new ApiError(400, "Content and videoId are required")
    }

    //update tweet
    const tweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        $set:{
            content
        }
      },
      { new: true }
    )

    //error handling 
    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }
    // return
    res.status(200).json(new ApiResponse(200,"Tweet updated successfully", tweet))
})

const deleteTweet = asyncHandler(async (req, res) => {
  const {tweetId} = req.params
  const userId = req.user?._id
  // validation
  if(!userId || !isValidObjectId(userId)){
    throw new ApiError(400, "Invalid user id")
  }
  if(!tweetId){
    throw new ApiError(400, "videoId is required")
  }

  //update tweet
  const tweet = await Tweet.findByIdAndDelete(tweetId)

  //error handling 
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  // return
  res.status(200).json(new ApiResponse(200,"Tweet Deleted successfully", tweet))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}