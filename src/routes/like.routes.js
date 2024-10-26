import { Router  } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { toggleVideoLike } from "../controllers/like.controller.js";


const router = Router()

//middleware

router.use(verifyJWT)

// routes

router.route("/toggle/v/:videoId").post(toggleVideoLike)


export default router;