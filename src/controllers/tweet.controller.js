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
    .populate("owner", {
      select:["$username","$email","$avatar"],
    })
    if(!tweets){
        throw new ApiError(500, "Failed to fetch tweets")
    }
    res.status(200).json(new ApiResponse(200,"tweets fetched successfully", tweets))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}