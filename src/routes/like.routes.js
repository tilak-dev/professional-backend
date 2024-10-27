import { Router  } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos,} from "../controllers/like.controller.js";


const router = Router()

//middleware

router.use(verifyJWT)

// routes

router.route("/toggle/v/:videoId").post(toggleVideoLike)
router.route("/toggle/t/:tweetId").post(toggleTweetLike)
router.route("/toggle/c/:commentId").post(toggleCommentLike)
router.route("/videos/:videoId").get(getLikedVideos)


export default router;