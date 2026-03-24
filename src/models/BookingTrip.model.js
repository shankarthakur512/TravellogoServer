import mongoose, { Schema } from "mongoose";

const bookingSchema = new Schema(
  {
    trip: {
      type: Schema.Types.ObjectId,
      ref: "Trip",
      required: true,
    },
    bookedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    guide: {
      type: Schema.Types.ObjectId,
      ref: "LocalGuide",
      required: true,
    },
    tripName: {
      type: String,
      required: true,
      trim: true,
    },
    tripLocation: {
      type: String,
      required: true,
      trim: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalUnitsBooked: {
      type: Number,
      required: true,
      min: 1,
    },
    travellers: {
      type: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          govtId: {
            type: String,
            required: true,
            trim: true,
          },
          age: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    paymentIntentId: {
      type: String,
      required: true,
      trim: true,
    },
    additionalRequests: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Booking = mongoose.model("BookingTrip", bookingSchema);

export default Booking;
