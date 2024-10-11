import dotenv from "dotenv";
import express from "express";
import dbConnect from "./db/index.js";

dotenv.config({
  path: `./env`,
});

const app = express();

dbConnect();
