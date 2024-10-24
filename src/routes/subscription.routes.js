import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels } from "../controllers/subscription.controller.js"
const router = Router()

//middleware
router.use(verifyJWT)


// routes
router.route("/toggle-subscribe").post(toggleSubscription)

router.route("/get-subscribers").post(getUserChannelSubscribers)

router.route("/get-subscribed-channel").post(getSubscribedChannels)


export default router;