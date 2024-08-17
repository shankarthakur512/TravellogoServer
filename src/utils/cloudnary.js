import {v2 as cloudinary}  from "cloudinary";
import fs from "fs"

const   uploadOnCloudinary = async (localFilePath) => {
    try {
     const response =  await cloudinary.uploader.upload(localFilePath , {
          resource_type : "auto"
        })
        // file has uploaded sucessfully
       console.log("file uploaded successfully" , response.url);
       fs.unlinkSync(localFilePath);
       return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove th locally saved temporary file as the upload
    }
}

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDNARY_CLOUD_NAME, 
  api_key: process.env.CLOUDNARY_API_KEY, 
  api_secret: process.env.CLOUDNARY_API_SECRET 
});

export {uploadOnCloudinary}
