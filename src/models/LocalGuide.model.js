import mongoose, { Schema } from "mongoose";

const LocalGuideSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  aboutYourself: {
    type: String,
    required: true
  },
  native: {
    type: String,
    required: true
  },
  mobileNo: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);  
      },
      message: props => `${props.value} is not a valid mobile number!`
    }
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\S+@\S+\.\S+$/.test(v);
      },
      message: props => `${props.value} is not a valid email address!`
    }
  },
  Govt_ID: {
    type: String,
    required: true
  },
  picture: {
    type: String,
    required: true
  },
  languages: {
    type: [String],  
    required: true
  }
});

const LocalGuide = mongoose.model('LocalGuide', LocalGuideSchema);

export default LocalGuide;
