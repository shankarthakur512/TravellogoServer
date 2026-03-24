import mongoose from "mongoose";

const bookedUserSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    totalUnitsBooked: {
      type: Number,
      min: 1,
      default: 1,
    },
  },
  { _id: false }
);

const tripSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LocalGuide",
      required: true,
      index: true,
    },
    tripName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    hotel: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
      },
    },
    itinerary: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    photos: {
      type: [String],
      default: [],
    },
    startingDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Upcoming", "Ongoing", "Completed", "Cancelled"],
      default: "Upcoming",
      required: true,
    },
    // This summary array lets the frontend show who booked a trip without querying bookings first.
    bookedByUsers: {
      type: [bookedUserSchema],
      default: [],
    },
    totalBookings: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalUnitsBooked: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

const Trip = mongoose.model("Trip", tripSchema);

export default Trip;
