import {Router} from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { createPlaylist } from "../controllers/playlist.controller.js"



const router = Router()

//middleware
router.use(verifyJWT)

//routes
router.route("/").post(createPlaylist)




export default router