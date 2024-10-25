import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  console.log("toggleSubscription")
  const { channelId } = req.params;
  const userId = req.user?.id;
  // TODO: toggle subscription
  //what to do
  //if true make it false remove subscriber
  //if false make it true add one subscriber in Subscriber
  //logic
  // check if channelId is valid
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel ID");
  }
  if (!userId) {
    throw new ApiError(401, "Not authorized");
  }

  //if user allready exists
  const userSubscription = await Subscription.findOne({
    subscriber:userId,
    channel:channelId,
  });
  if (!userSubscription) {
    //create subscription
    const newSubscription = new Subscription({
      subscriber:userId,
      channel:channelId,
    });
    await newSubscription.save();
    return res.status(200).json(new ApiResponse(200, newSubscription, true));
  }
  //remove subscription
  const cancelSubscription = await Subscription.findOneAndDelete({
    subscriber:userId,
    channel:channelId,
  } );

  if (!cancelSubscription) {
    throw new ApiError(404, "Subscription not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Subscription cancelled", true));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  //validation
  if (!channelId) {
    throw new ApiError(400, "Missing parameters ");
  }
  // check if channelId is valid
  const channelSubscribers = await Subscription.aggregate([
    {
      $match: {
        _id: isValidObjectId(channelId),
      },
    },
  ]);

  if (!channelSubscribers) {
    throw new ApiError(404, "No subscribers found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channelSubscribers[0], true));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  //logic
  //get user informatiion
  //get channel list
  const { subscriberId } = req.params;
  const userId = req.user?._id;
  //validation error
  if (!userId) {
    throw new ApiError(401, "Not authorized");
  }
  if (!subscriberId) {
    throw new ApiError(400, "Missing parameters ");
  }

  //get chennels
  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        _id: isValidObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "channel",
        localField: "_id",
        foreignField: "_id",
        as: "channel",
      },
    },
  ]);

  if (!subscribedChannels) {
    throw new ApiError(404, "No subscribed channels found");
  }
  // return res
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "channel list found succesfully ",
        subscribedChannels[0]
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
