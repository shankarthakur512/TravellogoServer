import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import { createLogger } from "./logger.js";

const cloudinaryLogger = createLogger("cloudinary");

const removeLocalFile = async (localFilePath) => {
  if (!localFilePath) {
    return;
  }

  try {
    await fs.unlink(localFilePath);
  } catch (error) {
    cloudinaryLogger.warn("Unable to remove local upload", {
      localFilePath,
      error: error.message,
    });
  }
};

export const uploadOnCloudinary = async (localFilePath, options = {}) => {
  if (!localFilePath) {
    return null;
  }

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      ...options,
    });

    cloudinaryLogger.info("File uploaded", {
      localFilePath,
      publicId: response.public_id,
    });

    return response;
  } catch (error) {
    cloudinaryLogger.error("Cloudinary upload failed", {
      localFilePath,
      error: error.message,
    });
    throw error;
  } finally {
    await removeLocalFile(localFilePath);
  }
};

cloudinary.config({
  cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
  api_key: process.env.CLOUDNARY_API_KEY,
  api_secret: process.env.CLOUDNARY_API_SECRET,
});
