import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { ApiError } from "../utils/ApiError.js";


const generateAccessAndRefreshToken = async (userId) => {
  try{
    const user = await User.findById(userId)
    if(!user) throw new ApiError ("user issue")
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    user.refreshToken = refreshToken;
    user.save({validateBeforeSave : false})

    return {accessToken , refreshToken}
  }catch(error){
    throw new ApiError(500 , "something went wrong while generating the refresh or accesstoken")
  }
}

const registerUser = async (req , res ,next) =>{
    try {
        const {fullname , email , username , password } = req.body
 
        if(
          [fullname,username , email , password].some((feild)=>feild?.trim()==="")
        ){
          res.status(400).send("All feilds are required")
        }
      
      const existeduser = await User.findOne(
        {
          $or : [{username} , {email}]
        }
      )
      if (existeduser) {
       res.status(404).send("User with username and email already exist")
      }
    
      const url = 'profile.avif'
     
    
      
      const user = await User.create({
        username ,
        fullname,
        email,
        avatar : url,
       password,
      
      })
      const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
      )
      if (!createdUser) {
      res.status(400).send("there is wrong something")
      }
      
      return res.status(201).json(
        res.status(200).json({createdUser})
        )
    } catch (error) {
        console.log(error)
    }
}

const CheckUser = async (req, res, next) =>{
 try{ 
  const {email} = req.body;

  const user = await User.findOne({email});
  // console.log(user)
  console.log(user)

  if(!user) return res.json(new ApiResponse(400 , null , "user not found", ))

    
 return res.status(200).json(new ApiResponse(200 , user , "success"))
}catch(error){
console.log(error)
 }
}

const LoginUser = async (req,res) =>{
//  console.log('yha to aa rha hai')
 try {
  const {email , password} = req.body
  console.log(email)
  if(!email) res.status(400).send("email is required")
  const user = await User.findOne(
  {email}
  )
  
  if(!user){
    throw new ApiError(404,"User doesn't exist")
  }
  // console.log(password)
const validuser = await user.isPasswordCorrect(password);
if(!validuser) throw new ApiError("password is incorrect")
const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
  const loggedInUser = await User.findById(user._id)
   .select("-password -refreshToken")
  const options ={
   httpOnly : true,
   secure : true
  }
  return res.status(200)
 .cookie("accessToken", accessToken,options)
 .cookie("refreshToken", refreshToken,options)
 .json(
  new ApiResponse(
    200,
    {
      user : loggedInUser 
       , accessToken , refreshToken
    },
    "User logged in Sucessfully "
  )
 )}
 catch(error){
 console.log(error)
 }


}


export {
  registerUser,
  LoginUser,
  CheckUser
}