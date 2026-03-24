import mongoose from "mongoose";
import LocalGuide from "../models/LocalGuide.model.js";
import { User } from "../models/user.model.js";
import BookingGuide from "../models/BookingGuide.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { createLogger } from "../utils/logger.js";

const guideLogger = createLogger("guide-controller");
const createBookingReference = (prefix = "GUIDE") =>
  `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

const normalizeLanguages = (languages) => {
  if (Array.isArray(languages)) {
    return languages.map((language) => language.trim()).filter(Boolean);
  }

  if (typeof languages === "string") {
    return languages
      .split(",")
      .map((language) => language.trim())
      .filter(Boolean);
  }

  return [];
};

const buildGuideOwnerPayload = (guide, userInfo) => ({
  _id: guide._id,
  user: guide.user,
  address: guide.address,
  country: guide.country,
  city: guide.city,
  aboutYourself: guide.aboutYourself,
  native: guide.native,
  mobileNo: guide.mobileNo,
  email: guide.email,
  Govt_ID: guide.Govt_ID,
  picture: guide.picture,
  languages: guide.languages,
  verificationStatus: guide.verificationStatus,
  createdAt: guide.createdAt,
  updatedAt: guide.updatedAt,
  userInfo: userInfo
    ? {
        _id: userInfo._id,
        username: userInfo.username,
        email: userInfo.email,
        fullname: userInfo.fullname,
        avatar: userInfo.avatar,
      }
    : undefined,
});

const buildGuideSearchPayload = (guide, userInfo) => ({
  _id: guide._id,
  address: guide.address,
  country: guide.country,
  city: guide.city,
  aboutYourself: guide.aboutYourself,
  native: guide.native,
  picture: guide.picture,
  languages: guide.languages,
  userInfo: userInfo
    ? {
        _id: userInfo._id,
        username: userInfo.username,
        email: userInfo.email,
        fullname: userInfo.fullname,
        avatar: userInfo.avatar,
      }
    : undefined,
});

const buildGuideDetailPayload = (guide, userInfo) => ({
  _id: guide._id,
  aboutYourself: guide.aboutYourself,
  address: guide.address,
  city: guide.city,
  country: guide.country,
  native: guide.native,
  picture: guide.picture,
  languages: guide.languages,
  userDetails: userInfo
    ? {
        _id: userInfo._id,
        fullname: userInfo.fullname,
        email: userInfo.email,
        avatar: userInfo.avatar,
      }
    : undefined,
});

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
      languages,
    } = req.body;

    if (
      ![user, address, country, city, aboutYourself, native, mobileNo, email, Govt_ID].every(
        (field) => field?.toString().trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "All guide fields are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const existingGuide = await LocalGuide.findOne({ user });

    if (existingGuide) {
      const existingUser = await User.findById(existingGuide.user);

      return res.status(200).json({
        success: true,
        message: "Guide profile already exists.",
        guide: buildGuideOwnerPayload(existingGuide, existingUser),
      });
    }

    const pictureUpload = req.file?.path ? await uploadOnCloudinary(req.file.path) : null;

    if (!pictureUpload?.secure_url && !pictureUpload?.url) {
      return res.status(400).json({
        success: false,
        message: "Guide profile photo is required.",
      });
    }

    const newGuide = await LocalGuide.create({
      user: new mongoose.Types.ObjectId(user),
      address: address.trim(),
      country: country.trim(),
      city: city.trim(),
      aboutYourself: aboutYourself.trim(),
      native: native.trim(),
      mobileNo: mobileNo.toString().trim(),
      email: email.trim().toLowerCase(),
      Govt_ID: Govt_ID.trim(),
      languages: normalizeLanguages(languages),
      picture: pictureUpload.secure_url || pictureUpload.url,
    });

    const guideUser = await User.findById(newGuide.user);

    guideLogger.info("Guide registered", { guideId: newGuide._id, userId: newGuide.user });

    return res.status(201).json({
      success: true,
      message: "Local guide registered successfully.",
      guide: buildGuideOwnerPayload(newGuide, guideUser),
    });
  } catch (error) {
    guideLogger.error("Guide registration failed", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Error registering local guide.",
    });
  }
};

export const findGuideByUser = async (req, res) => {
  try {
    const { user } = req.body;

    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ success: false, message: "Invalid user ID." });
    }

    const guide = await LocalGuide.findOne({ user });

    if (!guide) {
      return res.status(404).json({ success: false, message: "Local guide not found." });
    }

    const userInfo = await User.findById(guide.user);

    return res.status(200).json({
      success: true,
      message: "Local guide found.",
      guide: buildGuideOwnerPayload(guide, userInfo),
    });
  } catch (error) {
    guideLogger.error("Guide lookup by user failed", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Error finding local guide.",
    });
  }
};

export const findGuideByCity = async (req, res) => {
  try {
    const city = req.body.city?.trim();

    if (!city) {
      return res.status(400).json({ success: false, message: "City is required." });
    }

    const guides = await LocalGuide.find({
      city: { $regex: new RegExp(city, "i") },
    }).populate("user", "_id username email fullname avatar");

    return res.status(200).json({
      success: true,
      msg: "Success",
      guides: guides.map((guide) => buildGuideSearchPayload(guide, guide.user)),
    });
  } catch (error) {
    guideLogger.error("Guide lookup by city failed", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Error in finding guides.",
    });
  }
};

export const findGuideById = async (req, res) => {
  try {
    const { guideId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(guideId)) {
      return res.status(400).json({ success: false, msg: "Invalid guide ID." });
    }

    const guide = await LocalGuide.findById(guideId).populate("user", "_id fullname email avatar");

    if (!guide) {
      return res.status(404).json({ success: false, msg: "Guide not found." });
    }

    return res.status(200).json({
      success: true,
      msg: "Success",
      guide: buildGuideDetailPayload(guide, guide.user),
    });
  } catch (error) {
    guideLogger.error("Guide lookup by ID failed", { error: error.message });
    return res.status(500).json({ success: false, msg: "Server error." });
  }
};

export const scheduleGuideCall = async (req, res) => {
  try {
    const { guideId, bookedBy, selectedDate, selectedSlot } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(guideId) ||
      !mongoose.Types.ObjectId.isValid(bookedBy)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid guide or user ID.",
      });
    }

    if (!selectedDate || !selectedSlot?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Schedule date and slot are required.",
      });
    }

    const [guide, user] = await Promise.all([
      LocalGuide.findById(guideId),
      User.findById(bookedBy),
    ]);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found.",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const booking = await BookingGuide.create({
      guide: guide._id,
      bookedBy: user._id,
      bookingReference: createBookingReference(),
      travelDate: new Date(selectedDate),
      timeSlot: selectedSlot.trim(),
      status: "Confirmed",
      notes: `Scheduled by ${user.fullname}`,
    });

    guideLogger.info("Guide call scheduled", {
      guideId,
      bookedBy,
      bookingId: booking._id,
    });

    return res.status(201).json({
      success: true,
      booked: true,
      message: "Guide call scheduled successfully.",
      booking,
    });
  } catch (error) {
    guideLogger.error("Guide call scheduling failed", { error: error.message });
    return res.status(500).json({
      success: false,
      booked: false,
      message: "Unable to schedule guide call.",
    });
  }
};
