import mongoose from "mongoose";
import { ApiResponse } from "../utils/Apiresponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import LocalGuide from "../models/LocalGuide.model.js";

// Register Local Guide
export const registerGuide = async (req, res) => {
  try {
    const { 
      user, 
      address, 
      country, 
      city, 
      aboutYourself, 
      native, 
      mobileNo, 
      email, 
      Govt_ID, 
      languages 
    } = req.body;

    const PictureLocalPath = req.file.path;
    const Picture = await uploadOnCloudinary(PictureLocalPath);

    const newGuide = new LocalGuide({
      user: new mongoose.Types.ObjectId(user),
      address,
      country,
      city,
      aboutYourself,
      native,
      mobileNo,
      email,
      Govt_ID,
      languages: Array.isArray(languages) ? languages : (languages ? languages.split(',') : []),
      picture: Picture.url
    });

    const savedGuide = await newGuide.save();

    res.status(201).json({
      message: 'Local guide registered successfully',
      guide: savedGuide
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error registering local guide',
      error: error.message
    });
  }
};

// Find Local Guide by User ID
export const findGuideByUser = async (req, res) => {
  try {
    const { user } = req.body;

    // Check if user ID is valid
    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({
        message: 'Invalid user ID'
      });
    }

    // Find the guide by user ID
    const guide = await LocalGuide.findOne({ user: new mongoose.Types.ObjectId(user) });

    if (!guide) {
      return res.status(404).json({
        message: 'Local guide not found'
      });
    }

    res.status(200).json({
      message: 'Local guide found',
      guide
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error finding local guide',
      error: error.message
    });
  }
};
