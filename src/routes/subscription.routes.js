import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels } from "../controllers/subscription.controller.js"
const router = Router()

//middleware
router.use(verifyJWT)


// routes
router.route("/toggle-subscribe/:channelId").post(toggleSubscription)

router.route("/get-subscribers/:channelId").get(getUserChannelSubscribers)

router.route("/get-subscribed-channel/:subscriberId").get(getSubscribedChannels)


export default router;