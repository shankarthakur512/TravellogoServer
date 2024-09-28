import mongoose from 'mongoose';


const tripSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LocalGuide', 
    required: true
  },
  tripName : {
    type : String,
    required : true,
},
location : {
  type : String,
  required : true
},
 duration: {
    type: Number, 
    required: true
  },
  type: {
    type: String, 
    required: true
  },
  hotel: {
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number, 
      required: true,
      min: 0,
      max: 5
    }
  },
  itinerary: {
    type: String, 
    required: true
  },
  price: {
    type: Number, 
    required: true
  },
  photos: {
    type: [String], 
    required: false
  },
  startingDate: {
    type: Date,
    required: true
  },
 status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming',
    required: true
  },
  
},{timestamps : true});

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;

