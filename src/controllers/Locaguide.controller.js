import mongoose from "mongoose";
import { ApiResponse } from "../utils/Apiresponse.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import LocalGuide from "../models/LocalGuide.model.js";

export const registerGuide = async (req, res) => {
  console.log("yha aa rha hai")
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
    console.log("here")
    const PictureLocalPath = req.file.path;
    console.log(PictureLocalPath)
    const Picture = await uploadOnCloudinary(PictureLocalPath);
    console.log(Picture)

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
      languages,
      // languages: Array.isArray(languages) ? languages : languages.split(','), 
      picture: Picture.url
    });

    const savedGuide = await newGuide.save();

    res.status(201).json({
      message: 'Local guide registered successfully',
      guide: savedGuide
    });
  } catch (error) {
    console.log(error.message)
    res.status(500).json({
      message: 'Error registering local guide',
      error: error.message
    });
  }
};
