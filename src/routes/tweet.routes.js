import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js";
import { createTweet } from "../controllers/tweet.controller.js";

const router = Router()

//middleware

router.use(verifyJWT)

// routes
router.route("/").post(createTweet)




export default router;