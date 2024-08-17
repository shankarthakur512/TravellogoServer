const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Trip schema
const tripSchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'LocalGuide', // Assuming you have a LocalGuide model
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: String, // or Number, depending on how you want to represent duration
    required: true
  },
  type: {
    type: String, // You can also use an enum if you have predefined types
    required: true
  },
  facilities: {
    type: [String], // Array of strings to store multiple facilities
    required: false
  }
});

// Create the Trip model
const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
