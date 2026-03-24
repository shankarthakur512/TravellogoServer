import { Router } from "express";
import {
  findGuideByCity,
  findGuideById,
  findGuideByUser,
  registerGuide,
  scheduleGuideCall,
} from "../controllers/Locaguide.controller.js";
import { uploadTempImage } from "../middleware/multer.js";

const router = Router();

router.route("/register-guide").post(uploadTempImage.single("Photo"), registerGuide);
router.route("/find-guide").post(findGuideByUser);
router.route("/find-guideByCity").post(findGuideByCity);
router.route("/find-guide/:guideId").get(findGuideById);
router.route("/schedule-call").post(scheduleGuideCall);

export default router;
