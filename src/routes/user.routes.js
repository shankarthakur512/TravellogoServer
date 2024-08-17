import { Router } from "express";
// import { upload } from "../middleware/multer.js";
import { CheckUser, LoginUser, registerUser } from "../controllers/user.controller.js";
const router = Router();

router.route('/register-user').post(
    // upload.fields([{
    //     name : "avatar",
    //     maxCount : 1
    // } ]),
    registerUser
)

router.route("/login-user").post(LoginUser)
router.route("/check-user").post(CheckUser)
export default router;