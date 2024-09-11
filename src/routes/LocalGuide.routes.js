import multer from "multer";
import { Router } from "express";
import { findGuideByUser, registerGuide } from "../controllers/Locaguide.controller.js";

// Configure multer storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     console.log("yha bhi aa rha hai")
//     cb(null, './public/temp'); // Set the destination folder
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname); // Save the file with its original name
//   }
// });

// // Initialize multer with the configured storage
// const upload = multer({ storage });
const uploadImage = multer({dest : "public/temp/"});

const router = Router();

// Define the route with file upload middleware
router.route('/register-guide').post( uploadImage.single("Photo"),
 
  registerGuide // Handle the registration logic
);
router.route('/find-guide').post(findGuideByUser)
export default router;
