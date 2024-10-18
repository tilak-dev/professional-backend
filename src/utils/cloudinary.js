import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

if (
  !process.env.CLOUDINARY_API_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("Missing required environment variables for Cloudinary");
  process.exit(1); // learn  about it
}
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  //validation
  if (!localFilePath) {
    console.error(`Local file ${localFilePath} does not exist`);
    return null;
  }
  try {
    //upload
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      public_id: "anshu",
      resource_type: "auto",
    });
    if (!uploadResult) {
      console.log(`Error uploading to cloudinary`);
      return null;
    }

    console.log("Successfully uploaded : ", uploadResult);
    return uploadResult;
  } catch (error) {
    console.log(`Error while uploading to cloudinary: ${error}`);
    return null;
  }finally{
    fs.unlinkSync(localFilePath);
    //for cleaning the local fileas the upload fail // i'll learn more
  }
};


export default uploadOnCloudinary;