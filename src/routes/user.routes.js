import { Router } from "express";
// import { upload } from "../middleware/multer.js";
import { CheckUser, LoginUser, registerUser } from "../controllers/user.controller.js";
import multer from "multer";
const router = Router();

const uploadImage = multer({
    dest: "public/temp/", // Store files temporarily
    limits: { fileSize: 1024 * 1024 * 5 }, // Limit file size to 5MB
    fileFilter: (req, file, cb) => {
      if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true); // Accept file
      } else {
        cb(new Error("Invalid file type, only JPEG and PNG are allowed!"), false); // Reject file
      }
    }
  });
router.route('/register-user').post(
    uploadImage.single("avatar"),
    // upload.fields([{
    //     name : "avatar",
    //     maxCount : 1
    // } ]),
    registerUser
)

router.route("/login-user").post(LoginUser)
router.route("/check-user").post(CheckUser)
export default router;