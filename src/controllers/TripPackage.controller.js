import mongoose from "mongoose";
import Stripe from "stripe";
import Trip from "../models/TripPackage.model.js";
import LocalGuide from "../models/LocalGuide.model.js";
import BookingTrip from "../models/BookingTrip.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { createLogger } from "../utils/logger.js";

const tripLogger = createLogger("trip-controller");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const normalizeLocation = (location = "") => location.trim().toLowerCase();
const createBookingReference = (prefix = "TRIP") =>
  `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

const parseStartingDate = (rawDate) => {
  if (!rawDate) {
    return null;
  }

  // Frontend currently sends a native date input value in YYYY-MM-DD format.
  const isoDate = new Date(rawDate);
  if (!Number.isNaN(isoDate.getTime())) {
    return isoDate;
  }

  const parts = rawDate.split("/");
  if (parts.length === 3) {
    const slashDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    if (!Number.isNaN(slashDate.getTime())) {
      return slashDate;
    }
  }

  return null;
};

const buildTripSummary = (trip) => ({
  _id: trip._id,
  id: trip._id,
  tripName: trip.tripName,
  name: trip.hotel?.name,
  hotel: trip.hotel?.name,
  rating: trip.hotel?.rating,
  description: trip.itinerary,
  duration: trip.duration,
  photos: trip.photos,
  price: trip.price,
  startingDate: trip.startingDate,
  status: trip.status,
  type: trip.type,
});

const buildTripDetail = (trip, guide) => ({
  _id: trip._id,
  tripName: trip.tripName,
  location: trip.location,
  duration: trip.duration,
  type: trip.type,
  hotel: trip.hotel,
  price: trip.price,
  itinerary: trip.itinerary,
  photos: trip.photos,
  startingDate: trip.startingDate,
  status: trip.status,
  bookedByUsers: trip.bookedByUsers,
  totalBookings: trip.totalBookings,
  totalUnitsBooked: trip.totalUnitsBooked,
  guideDetails: guide
    ? {
        aboutYourself: guide.aboutYourself,
        address: guide.address,
        city: guide.city,
        country: guide.country,
        native: guide.native,
        picture: guide.picture,
        languages: guide.languages,
      }
    : null,
  userDetails: guide?.user
    ? {
        _id: guide.user._id,
        fullName: guide.user.fullname,
        email: guide.user.email,
        profilePicture: guide.user.avatar,
      }
    : null,
});

const buildBookedTripPayload = (booking) => ({
  _id: booking._id,
  bookingReference: booking.bookingReference,
  status: booking.status,
  paymentStatus: booking.paymentStatus,
  totalUnitsBooked: booking.totalUnitsBooked,
  totalPrice: booking.totalPrice,
  unitPrice: booking.unitPrice,
  createdAt: booking.createdAt,
  travellers: booking.travellers,
  trip: booking.trip
    ? {
        _id: booking.trip._id,
        tripName: booking.trip.tripName,
        location: booking.trip.location,
        photos: booking.trip.photos,
        startingDate: booking.trip.startingDate,
        type: booking.trip.type,
        status: booking.trip.status,
      }
    : {
        _id: booking.trip,
        tripName: booking.tripName,
        location: booking.tripLocation,
        photos: [],
      },
  guide: booking.guide
    ? {
        _id: booking.guide._id,
        city: booking.guide.city,
        country: booking.guide.country,
        picture: booking.guide.picture,
        userDetails: booking.guide.user
          ? {
              _id: booking.guide.user._id,
              fullName: booking.guide.user.fullname,
              profilePicture: booking.guide.user.avatar,
            }
          : null,
      }
    : null,
});

export const registerTourPackage = async (req, res) => {
  try {
    const {
      createdBy,
      tripName,
      Location,
      duration,
      type,
      hotel,
      hotelRating,
      price,
      itinerary,
      startingDate,
      status,
    } = req.body;

    if (
      ![createdBy, tripName, Location, duration, type, hotel, hotelRating, price, itinerary, startingDate].every(
        (field) => field?.toString().trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "All trip fields are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(createdBy)) {
      return res.status(400).json({
        success: false,
        message: "Invalid guide ID.",
      });
    }

    const guide = await LocalGuide.findById(createdBy);

    if (!guide) {
      return res.status(404).json({
        success: false,
        message: "Guide not found.",
      });
    }

    const parsedDate = parseStartingDate(startingDate);

    if (!parsedDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid starting date.",
      });
    }

    const uploadedPhotos = await Promise.all(
      (req.files?.photos || []).map(async (file) => {
        const photo = await uploadOnCloudinary(file.path);
        return photo?.secure_url || photo?.url;
      })
    );

    const photos = uploadedPhotos.filter(Boolean);

    const newTrip = await Trip.create({
      createdBy,
      tripName: tripName.trim(),
      location: normalizeLocation(Location),
      duration: Number(duration),
      type: type.trim(),
      hotel: {
        name: hotel.trim(),
        rating: Number(hotelRating),
      },
      price: Number(price),
      status: status?.trim() || "Upcoming",
      itinerary: itinerary.trim(),
      startingDate: parsedDate,
      photos,
    });

    tripLogger.info("Trip created", { tripId: newTrip._id, guideId: createdBy });

    return res.status(201).json({
      success: true,
      message: "Trip created successfully.",
      trip: newTrip,
    });
  } catch (error) {
    tripLogger.error("Trip creation failed", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Failed to create trip.",
    });
  }
};

export const getTripsByLocalGuide = async (req, res) => {
  try {
    const { GuideId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(GuideId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid guide ID.",
      });
    }

    const trips = await Trip.find({ createdBy: GuideId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Trips fetched successfully.",
      trips: trips.map(buildTripSummary),
    });
  } catch (error) {
    tripLogger.error("Guide trips fetch failed", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Error fetching trips.",
    });
  }
};

export const getTripByLocation = async (req, res) => {
  try {
    const location = req.body.location?.trim();

    if (!location) {
      return res.status(400).json({ success: false, msg: "Location is required." });
    }

    const trips = await Trip.find({ location: normalizeLocation(location) })
      .populate({
        path: "createdBy",
        select: "aboutYourself address city country native picture languages user",
        populate: {
          path: "user",
          select: "_id fullname email avatar",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      msg: "success",
      trips: trips.map((trip) => buildTripDetail(trip, trip.createdBy)),
    });
  } catch (error) {
    tripLogger.error("Trip lookup by location failed", { error: error.message });
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

export const getTripDetailById = async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({ success: false, msg: "Invalid trip ID." });
    }

    const trip = await Trip.findById(tripId).populate({
      path: "createdBy",
      select: "aboutYourself address city country native picture languages user",
      populate: {
        path: "user",
        select: "_id fullname email avatar",
      },
    });

    if (!trip) {
      return res.status(404).json({ success: false, msg: "No packages found" });
    }

    return res.status(200).json({
      success: true,
      msg: "success",
      trips: [buildTripDetail(trip, trip.createdBy)],
    });
  } catch (error) {
    tripLogger.error("Trip detail lookup failed", { error: error.message });
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

export const getFeaturedTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ status: "Upcoming" })
      .populate({
        path: "createdBy",
        select: "aboutYourself address city country native picture languages user",
        populate: {
          path: "user",
          select: "_id fullname email avatar",
        },
      })
      .sort({ totalBookings: -1, createdAt: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      trips: trips.map((trip) => buildTripDetail(trip, trip.createdBy)),
    });
  } catch (error) {
    tripLogger.error("Featured trips fetch failed", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Unable to load featured trips.",
    });
  }
};

export const bookTripAfterPayment = async (req, res) => {
  try {
    const { tripId, bookedBy, personDetails, paymentIntentId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tripId) || !mongoose.Types.ObjectId.isValid(bookedBy)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip or user ID.",
      });
    }

    if (!Array.isArray(personDetails) || personDetails.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Traveller details are required.",
      });
    }

    if (!paymentIntentId?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required.",
      });
    }

    const existingBooking = await BookingTrip.findOne({ paymentIntentId: paymentIntentId.trim() });

    if (existingBooking) {
      return res.status(200).json({
        success: true,
        booked: true,
        message: "Trip already booked for this payment.",
        booking: existingBooking,
      });
    }

    const [trip, user] = await Promise.all([Trip.findById(tripId), User.findById(bookedBy)]);

    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found." });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId.trim());

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({
        success: false,
        booked: false,
        message: "Payment is not completed yet.",
      });
    }

    const travellers = personDetails.map((person) => ({
      name: person.name?.trim(),
      govtId: person.govtId?.trim(),
      age: Number(person.age),
    }));

    const totalUnitsBooked = travellers.length;
    const totalPrice = Number(trip.price) * totalUnitsBooked;

    const booking = await BookingTrip.create({
      trip: trip._id,
      guide: trip.createdBy,
      bookedBy,
      tripName: trip.tripName,
      tripLocation: trip.location,
      unitPrice: Number(trip.price),
      totalPrice,
      totalUnitsBooked,
      travellers,
      paymentStatus: "Paid",
      status: "Confirmed",
      bookingReference: createBookingReference(),
      paymentIntentId: paymentIntentId.trim(),
    });

    const existingBookedUser = trip.bookedByUsers.find(
      (entry) => entry.user.toString() === bookedBy.toString()
    );

    if (existingBookedUser) {
      existingBookedUser.totalUnitsBooked += totalUnitsBooked;
      existingBookedUser.fullname = user.fullname;
    } else {
      trip.bookedByUsers.push({
        user: user._id,
        fullname: user.fullname,
        totalUnitsBooked,
      });
    }

    trip.totalBookings += 1;
    trip.totalUnitsBooked += totalUnitsBooked;
    await trip.save();

    tripLogger.info("Trip booked", {
      tripId,
      bookingId: booking._id,
      bookedBy,
      paymentIntentId,
    });

    return res.status(201).json({
      success: true,
      booked: true,
      message: "Trip booked successfully.",
      booking,
    });
  } catch (error) {
    tripLogger.error("Trip booking failed", { error: error.message });
    return res.status(500).json({
      success: false,
      booked: false,
      message: "Unable to complete the trip booking.",
    });
  }
};

export const getBookedTripsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const bookings = await BookingTrip.find({ bookedBy: userId })
      .populate("trip")
      .populate({
        path: "guide",
        select: "city country picture user",
        populate: {
          path: "user",
          select: "_id fullname avatar",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      bookings: bookings.map(buildBookedTripPayload),
    });
  } catch (error) {
    tripLogger.error("Booked trips fetch failed", { error: error.message });
    return res.status(500).json({
      success: false,
      message: "Unable to load booked trips.",
    });
  }
};
