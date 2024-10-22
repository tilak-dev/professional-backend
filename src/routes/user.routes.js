import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  changeUserPassword,
  currentUser,
  updateUserDetails,
  uploadUserAvatar,
  uploadUserCover,
  getUserChannelProfile,
  getUserWatchHistory,
} from "../controllers/user.controller.js";
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

//change password
router.route("/change-password").put(verifyJWT, changeUserPassword);

//get current user
router.route("/current-user").get(verifyJWT, currentUser);

//get uploadUserAvatar
router
  .route("/change-avatar")
  .patch(verifyJWT, upload.single("avatar"), uploadUserAvatar);

//get updateUserDetails
router.route("/update-details").patch(verifyJWT, updateUserDetails);

//get uploadUserCover,
router
  .route("/change-cover")
  .patch(verifyJWT, upload.single("coverImage"), uploadUserCover);

//get getUserChannelProfile
router.route("/user-channel/:username").get(verifyJWT, getUserChannelProfile);

//get getUserWatchHistory

router.route("/watch-history").get(verifyJWT, getUserWatchHistory);

export default router;

// todo cloudinary previous image delete
