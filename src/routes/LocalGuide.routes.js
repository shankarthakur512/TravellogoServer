import multer from "multer";
import { Router } from "express";
import { registerGuide } from "../controllers/Locaguide.controller.js";

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
  // (req, res, next) => {
  //   upload.fields([{ name: "Photo", maxCount: 1 }])(req, res, (err) => {
  //     if (err instanceof multer.MulterError) {
  //       // A Multer error occurred when uploading.
  //       return res.status(500).json({ error: err.message });
  //     } else if (err) {
  //       // An unknown error occurred when uploading.
  //       return res.status(500).json({ error: "An unknown error occurred." });
  //     }
  //     next(); // If no error, proceed to the next middleware
  //   });
  // },
  registerGuide // Handle the registration logic
);

export default router;
