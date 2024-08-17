import mongoose , {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
// we practised datamodel on starblitz.com 
// we make architecture on moon modeller or explore.ai

const userSchema = new Schema({
  username : {
    type : String,
    required : true,
    unique : true,
    lowercase : true,
    trim : true,
    lowecase : true,
    index : true
  },
  email : {
      type : String,
      required : true,
      lowercase : true,
      trim : true,
      lowecase : true,
  },
  fullname : {
    type : String,
    required : true,
    index : true,
    trim : true
  },
  password : {
    type : String , // we have to encrypt this
    required : true,
  },

avatar : {
    type: String , // we use third party location to store our image cloudnary url
  
},


refreshToken : {
      type : String,
 }
},{timestamps : true})
userSchema.pre("save", async function (next) {
  if(!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    // console.log('shi hsi')
  const reply =  await bcrypt.compare(password, this.password)
//  console.log(reply);
  return reply
}

userSchema.methods.generateAccessToken = function(){
  // console.log('aa rha hai bhai access me')
  return jwt.sign(
      {
          _id: this._id,
          email: this.email,
          username: this.username,
          fullName: this.fullName
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
  )
}
userSchema.methods.generateRefreshToken = function(){
  // console.log('aa rha hai bhai')
  return jwt.sign(
      {
          _id: this._id,
          
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY
      }
  )
}
export const User = mongoose.model("User" , userSchema)