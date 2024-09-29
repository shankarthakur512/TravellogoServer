import { Router } from "express";
import {registerTourPackage,  getTripsByLocalGuide ,getTripByLocation, getTripDetailById} from "../controllers/TripPackage.controller.js";
import upload from "../middleware/multer.js";


const router = Router();



router.route("/register-trip").post(
 upload.fields([{
        name : "photos",
        maxCount : 10
    } ])
,registerTourPackage)

router.get('/trips/:GuideId', getTripsByLocalGuide);

router.post('/find-trips' , getTripByLocation);
router.get('/find-trip/:tripId' , getTripDetailById)

export default router;