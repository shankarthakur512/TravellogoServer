import mongoose, { Schema } from "mongoose";

const bookingGuideSchema = new Schema(
  {
    guide: {
      type: Schema.Types.ObjectId,
      ref: "LocalGuide",
      required: true,
    },
    bookedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    travelDate: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

const BookingGuide = mongoose.model("BookingGuide", bookingGuideSchema);

export default BookingGuide;
