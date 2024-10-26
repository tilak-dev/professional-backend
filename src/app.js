import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app= express()

// Middlewares

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit:"16kb"}))
app.use(express.static("public"))
// CORS middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true, // Enable cookies
}))
// Cookie Parser middleware
app.use(cookieParser())

//  import Routes
import userRouter from "./routes/user.routes.js"
import healthCheckRouter from "./routes/healthcheck.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import commentRouter from "./routes/comment.routes.js"


//route declarations
app.use("/api/v1/users", userRouter)
app.use("/api/v1/health", healthCheckRouter)
app.use("/api/v1/subscription", subscriptionRouter)
app.use("/api/v1/video", videoRouter)
app.use("/api/v1/tweet", tweetRouter)
app.use("/api/v1/comment", commentRouter)
//exampl
//url/api/v1/users/register



export {app}