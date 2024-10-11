import mongoose from "mongoose";
import { DATABASE_NAME } from "../constants.js";

// Connect to MongoDB
const dbConnect = async () => {
  try {
    const connectionInstanse = await mongoose.connect(
      `${process.env.MONGO_URI}/${DATABASE_NAME}`
    );
    console.log(
      `db connected successfully , Host: ${connectionInstanse.connection.host}`
    );
  } catch (error) {
    console.log("error in connect mongodb", error);
    process.exit(1);
  }
};

export default dbConnect;