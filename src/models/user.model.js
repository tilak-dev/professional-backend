import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // isse username search system me aa jayega and expensive hota h
    },
    password: {
      type: String,
      required: [true, "password is required"],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true, // isse fullname search system me aa jayega and expensive hota h
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    coverImage: {
      type: String, // cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

//tokens
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      //payload
      id: this._id,
      username: this.username,
      fullName: this.fullName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY, // time
    }
  );
};
//tokens
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      //payload
      id: this._id,
    },
    process.env.REPRESS_TOKEN_SECRET,
    {
      expiresIn: process.env.REPRESS_TOKEN_EXPIRY, // time
    }
  );
};

//comparing password
userSchema.methods.isCorrectPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// hashing password before saving
userSchema.pre("save", async function (next) {
  // now it will run every time when data base is called
  if (!this.isModified("password")) return next(); // if password is not modified then no hashing required  to fixed th rerender issue
  this.password = await bcrypt.hash(this.password, 10);
  next(); // next work kro
});

export const User = mongoose.model("User", userSchema);
