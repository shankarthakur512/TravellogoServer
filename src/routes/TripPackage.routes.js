import { Router } from "express";
import {
  bookTripAfterPayment,
  getBookedTripsByUser,
  getFeaturedTrips,
  getTripByLocation,
  getTripDetailById,
  getTripsByLocalGuide,
  registerTourPackage,
} from "../controllers/TripPackage.controller.js";
import uploadTripPhotos from "../middleware/multer.js";

const router = Router();

router
  .route("/register-trip")
  .post(uploadTripPhotos.fields([{ name: "photos", maxCount: 10 }]), registerTourPackage);

router.get("/trips/:GuideId", getTripsByLocalGuide);
router.get("/featured-trips", getFeaturedTrips);
router.get("/booked-trips/:userId", getBookedTripsByUser);
router.post("/book-trip", bookTripAfterPayment);
router.post("/find-trips", getTripByLocation);
router.get("/find-trip/:tripId", getTripDetailById);

export default router;
