import { Router } from "express";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { addComment , updateComment, deleteComment} from "../controllers/comment.controller.js";

const router = Router()

//middleware

router.use(verifyJWT)

// routes
router.route("/:videoId").post(addComment)

router.route("/c/:commentId")
.patch(updateComment)
.delete(deleteComment)

export default router