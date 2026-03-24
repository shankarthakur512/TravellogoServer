import nodemailer from "nodemailer";
import { createLogger } from "../utils/logger.js";

const mailLogger = createLogger("sendmail-controller");

const createTransporter = () => {
  const user = process.env.MAIL_USER;
  const pass = process.env.MAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
};

const generateOtp = () =>
  Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join("");

export const Sendmail = async (req, res) => {
  try {
    const email = req.body.email?.trim();

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    const otp = generateOtp();
    const transporter = createTransporter();

    if (!transporter) {
      mailLogger.warn("Mail credentials missing. Returning OTP without delivery.", { email });
      return res.status(200).json({
        success: true,
        otp,
        message: "OTP generated in local fallback mode.",
      });
    }

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "The Verification Code",
      text: `Your OTP is ${otp}`,
    });

    mailLogger.info("OTP email sent", { email });

    return res.status(200).json({
      success: true,
      otp,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    mailLogger.error("OTP send failed", { error: error.message });
    return res.status(500).json({ success: false, error: "Failed to send OTP" });
  }
};
