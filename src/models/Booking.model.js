import mongoose from "mongoose";
import { Schema } from "mongoose";

// Define the Booking Schema
const bookingSchema = new Schema({
  trip: {
    type: Schema.Types.ObjectId,
    ref: 'Trip', // Reference to the Trip model
    required: true
  },
  guest: {
    type: Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model (for guest)
    required: true
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: 'LocalGuide', // Reference to the LocalGuide model (for host)
    required: true
  },
  bookingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled'],
    default: 'Pending'
  },
  numberOfGuests: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  additionalRequests: {
    type: String,
    trim: true
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt timestamps
});

// Create the Booking model
const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
