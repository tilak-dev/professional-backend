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

// Routes




export {app}