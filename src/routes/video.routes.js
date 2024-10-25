import { Router } from "express";
import { publishAVideo } from "../controllers/video.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// middleware
router.use(verifyJWT)

// create routes

router.route("/").post(upload.fields([
  {
    name: "thumbnail",
    maxCount: 1
  },
  {
    name: "videoFile",
    maxCount: 1
  }
]), publishAVideo)

export default router;

//url/api/v1/videos/publish