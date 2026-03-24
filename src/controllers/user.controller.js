import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { createLogger } from "../utils/logger.js";

const userLogger = createLogger("user-controller");

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const normalizeUsername = (username = "") => username.trim().toLowerCase();

const buildCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
});

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId).select("+refreshToken");

  if (!user) {
    throw new Error("Unable to find user while generating tokens.");
  }

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const registerUser = async (req, res) => {
  try {
    const { fullname, email, username, password } = req.body;
    const avatarLocalPath = req.file?.path || null;

    if (![fullname, email, username, password].every((field) => field?.trim())) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const normalizedUsername = normalizeUsername(username);

    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with username or email already exists.",
      });
    }

    const avatarUpload = avatarLocalPath ? await uploadOnCloudinary(avatarLocalPath) : null;

    const user = await User.create({
      fullname: fullname.trim(),
      email: normalizedEmail,
      username: normalizedUsername,
      password,
      avatar: avatarUpload?.secure_url || avatarUpload?.url || "",
    });

    const createdUser = await User.findById(user._id);

    userLogger.info("User registered", {
      userId: createdUser?._id,
      email: createdUser?.email,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: createdUser,
    });
  } catch (error) {
    userLogger.error("User registration failed", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Unable to register user right now.",
    });
  }
};

export const CheckUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json(new ApiResponse(400, null, "Email is required."));
    }

    const user = await User.findOne({ email: normalizeEmail(email) });

    if (!user) {
      return res.status(200).json(new ApiResponse(404, null, "User not found."));
    }

    return res.status(200).json(new ApiResponse(200, user, "Success"));
  } catch (error) {
    userLogger.error("User lookup failed", { error: error.message });
    return res.status(500).json(new ApiResponse(500, null, "Unable to check user."));
  }
};

export const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({ email: normalizeEmail(email) }).select("+password +refreshToken");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id);

    userLogger.info("User logged in", { userId: user._id, email: user.email });

    return res
      .status(200)
      .cookie("accessToken", accessToken, buildCookieOptions())
      .cookie("refreshToken", refreshToken, buildCookieOptions())
      .json(
        new ApiResponse(
          200,
          {
            user: loggedInUser,
            accessToken,
            refreshToken,
          },
          "User logged in successfully."
        )
      );
  } catch (error) {
    userLogger.error("User login failed", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Unable to log in right now.",
    });
  }
};
