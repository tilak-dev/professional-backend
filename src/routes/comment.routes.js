import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addComment } from "../controllers/comment.controller.js";

const router = Router()

//middleware

router.use(verifyJWT)

// routes
router.route("/:videoId").post(addComment)

export default router