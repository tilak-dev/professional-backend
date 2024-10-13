import mongoose from "mongoose";
import { DATABASE_NAME } from "./constants";
import express from "express";

const app = express();

// for Connect to MongoDB
//ifications
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DATABASE_NAME}`);
    console.log("Connected to MongoDB successfully!");
    app.on("error", (err) => {
      console.log("Failed to connect to MongoDB", err);
      throw err
    });
    // Start the server
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
})();


// for handling incoming requests data base
const asyncHandler = (fun) => async (req, res, next) => {
  try {
    await fun(req, res, next);
  } catch (error) {
    console.error(error);
    return res.status(error.code || 500).json({
      success: false,
      message: error.message || "An unexpected error occurred.",
    });
  }
};
