import { Router } from "express";
import { loginUser, logoutUser, refreshToken, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// create routes
// register routes
router.route("/register").post(
  upload.fields([
    //middlenames
    { name: "avatar", maxCount: 1 },
    { name: "cover_image", maxCount: 1 },
  ]),
  registerUser
);

//login user
router.route("/login").post(loginUser);
//logout
router.route("/logout").post(verifyJWT, logoutUser);

//refresh token
router.route("/refresh-token").post(refreshToken);

export default router;


// todo cloudinary previous image delete 