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

    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const guide = await LocalGuide.aggregate([
      {
        $match: { user: new mongoose.Types.ObjectId(user) },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $project: {
          _id: 1,
          address: 1,
          country: 1,
          city: 1,
          aboutYourself: 1,
          native: 1,
          mobileNo: 1,
          email: 1,
          Govt_ID: 1,
          picture: 1,
          languages: 1,
          userInfo: {
            _id: 1,
            username: 1,
            email: 1,
            fullname: 1,
          },
        },
      },
    ]);

    if (!guide.length) {
      return res.status(404).json({ message: "Local guide not found" });
    }

    res.status(200).json({
      message: "Local guide found",
      guide: guide[0],
    });
  } catch (error) {
    res.status(500).json({
      message: "Error finding local guide",
      error: error.message,
    });
  }
};

// Find Local Guide by City with Aggregation
export const findGuideByCity = async (req, res) => {
  const { city } = req.body;
  try {
    const guides = await LocalGuide.aggregate([
      { $match: { city: city.toLowerCase() } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: 1,
          address: 1,
          country: 1,
          city: 1,
          aboutYourself: 1,
          native: 1,
          mobileNo: 1,
          email: 1,
          Govt_ID: 1,
          picture: 1,
          languages: 1,
          "userInfo.username": 1,
          "userInfo.email": 1,
          "userInfo.fullname": 1,
        },
      },
    ]);

    if (!guides.length) {
      return res.json({ msg: "No such guides" });
    }

    res.status(200).json({ msg: "Success", guides });
  } catch (error) {
    res.status(500).json({ message: "Error in finding guides", error: error.message });
  }
};