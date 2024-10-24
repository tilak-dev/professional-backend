import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user?.userId;
  // TODO: toggle subscription
  //what to do
  //if true make it false remove subscriber
  //if false make it true add one subscriber in Subscriber
  //logic
  // check if channelId is valid
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID");
  }
  if(!userId){
    throw new ApiError(401, "Not authorized");
  }

  //if user allready exists
  const userSubscription = await Subscription.findOne({
    userId,
    channelId,
  });
  if (!userSubscription) {
    //create subscription
    const newSubscription = new Subscription({
      userId,
      channelId,
    });
    await newSubscription.save();
    return res.status(200).json(new ApiResponse(200, newSubscription, true));
  }
  //remove subscription
  const cancelSubscription = await Subscription.findByIdAndDelete(
    userId,
    channelId
  )
  
  if (!cancelSubscription) {
    throw new ApiError(404, "Subscription not found");
  }
  return res.status(200).json(new ApiResponse(200, "Subscription cancelled", true));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
