import mongoose from "mongoose";
import { Schema } from "mongoose";

// Define the Booking Schema
const bookingSchema = new Schema({
  trip: {
    type: Schema.Types.ObjectId,
    ref: 'Trip', 
    required: true
  },
  guest: {
    type: Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  host: {
    type: Schema.Types.ObjectId,
    ref: 'LocalGuide', 
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
  timestamps: true 
});


const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
