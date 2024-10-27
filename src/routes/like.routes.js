import { Router  } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { toggleVideoLike, toggleCommentLike, toggleTweetLike,} from "../controllers/like.controller.js";


const router = Router()

//middleware

router.use(verifyJWT)

// routes

router.route("/toggle/v/:videoId").post(toggleVideoLike)
router.route("/toggle/t/:tweetId").post(toggleTweetLike)
router.route("/toggle/c/:commentId").post(toggleCommentLike)


export default router;