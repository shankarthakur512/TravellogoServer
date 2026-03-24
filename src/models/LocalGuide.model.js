import mongoose, { Schema } from "mongoose";

const LocalGuideSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    aboutYourself: {
      type: String,
      required: true,
      trim: true,
    },
    native: {
      type: String,
      required: true,
      trim: true,
    },
    // Keep phone as a string so leading zeroes are preserved.
    mobileNo: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^\d{10,15}$/.test(value);
        },
        message: (props) => `${props.value} is not a valid mobile number.`,
      },
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value) {
          return /^\S+@\S+\.\S+$/.test(value);
        },
        message: (props) => `${props.value} is not a valid email address.`,
      },
    },
    Govt_ID: {
      type: String,
      required: true,
      trim: true,
    },
    picture: {
      type: String,
      required: true,
    },
    languages: {
      type: [String],
      default: [],
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "verified",
    },
  },
  { timestamps: true }
);

const LocalGuide = mongoose.model("LocalGuide", LocalGuideSchema);

export default LocalGuide;
