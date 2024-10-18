import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import {upload}from "../middlewares/multer.middleware.js"

const router = Router();

// create routes 
router.route("/register").post(
  upload.fields([
    //middlenames
    {name: 'avatar', maxCount: 1},
    {name: 'cover_image', maxCount: 1},
  ]),
  registerUser
) 


export default router  