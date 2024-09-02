import { Router } from "express";
import {registerTourPackage,  getTripsByLocalGuide } from "../controllers/TripPackage.controller.js";
import upload from "../middleware/multer.js";


const router = Router();



router.route("/register-trip").post(
 upload.fields([{
        name : "photos",
        maxCount : 10
    } ])
,registerTourPackage)

router.get('/trips/:GuideId', getTripsByLocalGuide);

export default router;