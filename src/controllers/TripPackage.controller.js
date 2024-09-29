import Trip from "../models/TripPackage.model.js";
import LocalGuide from "../models/LocalGuide.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import mongoose from "mongoose";

export const registerTourPackage = async (req, res) => {
  try {
    const { createdBy, tripName, Location, duration, type, hotel, hotelRating, price, status, itinerary, startingDate } = req.body;

    // Format the starting date
    const parts = startingDate.split('/');
    const formattedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);

    // Upload photos to Cloudinary and get their URLs
    const photospath = req.files.photos.map(file => file.path);
    const photosUrl = await Promise.all(
      photospath.map(async file => {
        try {
          const photo = await uploadOnCloudinary(file);
          return photo.url;
        } catch (error) {
          console.error("Error uploading photo:", error);
          return null; // Handle the error if needed, e.g., skip failed uploads
        }
      })
    ).then(urls => urls.filter(url => url !== null)); // Filter out any failed uploads

    const hoteldetails = { name: hotel, rating: hotelRating };

    const newTrip = new Trip({
      createdBy,
      tripName,
      location: Location.toLowerCase(),
      duration,
      type,
      hotel: hoteldetails,
      price,
      status,
      itinerary,
      startingDate: formattedDate,
      photos: photosUrl,
    });

    await newTrip.save();

    res.status(201).json({
      message: 'Trip created successfully!',
      trip: newTrip,
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({
      message: 'Failed to create trip',
      error: error.message,
    });
  }
};

export const getTripsByLocalGuide = async (req, res) => {
  try {
    const { GuideId } = req.params;
    const trips = await Trip.find({ createdBy: GuideId });

    const groupedTrips = trips.map(trip => ({
      id: trip._id,
      name: trip.hotel.name,
      rating: trip.hotel.rating,
      description: trip.itinerary,
      duration: trip.duration,
      photos: trip.photos,
      price: trip.price,
      startingDate: trip.startingDate,
      status: trip.status,
      type: trip.type,
    }));

    res.status(200).json({
      message: 'Trips fetched successfully!',
      trips: groupedTrips,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching trips',
      error: error.message,
    });
  }
};

export const getTripByLocation = async (req, res) => {
  const { location } = req.body;

  try {
    const trips = await Trip.aggregate([
      { $match: { location: location.toLowerCase() } }, // Match location
      {
        $lookup: {
          from: 'localguides', // Collection name for LocalGuide
          localField: 'createdBy',
          foreignField: '_id',
          as: 'guideDetails',
        },
      },
      { $unwind: '$guideDetails' }, // Unwind to include guide details
      {
        $lookup: {
          from: 'users', // Assuming 'users' is the collection for User data
          localField: 'guideDetails.user', // Field linking LocalGuide to User (assume userId exists in LocalGuide)
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' }, // Unwind to include user details
      {
        $project: {
          _id: 1,
          tripName: 1,
          location: 1,
          duration: 1,
          type: 1,
          hotel: 1,
          price: 1,
          itinerary: 1,
          photos: 1,
          startingDate: 1,
          status: 1,
          guideDetails: {
            Govt_ID: '$guideDetails.Govt_ID',
            aboutYourself: '$guideDetails.aboutYourself',
            address: '$guideDetails.address',
            city: '$guideDetails.city',
            country: '$guideDetails.country',
            email: '$guideDetails.email',
            mobileNo: '$guideDetails.mobileNo',
            native: '$guideDetails.native',
            picture: '$guideDetails.picture',
            languages: '$guideDetails.languages',
          },
          userDetails: {
            _id: 1,
            fullName: '$userDetails.fullname',
            email: '$userDetails.email',
            profilePicture: '$userDetails.avatar',
          },
        },
      },
    ]);

    if (trips.length === 0) {
      return res.json({ msg: "No packages found" });
    }

    return res.json({ msg: "success", trips });
  } catch (error) {
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};


export const getTripDetailById = async (req, res) => {
  const  { tripId }  = req.params;

  try {
    const trips = await Trip.aggregate([
     {$match : {_id : new mongoose.Types.ObjectId(tripId)}}, // Match location
      {
        $lookup: {
          from: 'localguides', 
          localField: 'createdBy',
          foreignField: '_id',
          as: 'guideDetails',
        },
      },
      { $unwind: '$guideDetails' }, 
      {
        $lookup: {
          from: 'users',  
          localField: 'guideDetails.user', // Field linking LocalGuide to User (assume userId exists in LocalGuide)
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' }, // Unwind to include user details
      {
        $project: {
          _id: 1,
          tripName: 1,
          location: 1,
          duration: 1,
          type: 1,
          hotel: 1,
          price: 1,
          itinerary: 1,
          photos: 1,
          startingDate: 1,
          status: 1,
          guideDetails: {
            Govt_ID: '$guideDetails.Govt_ID',
            aboutYourself: '$guideDetails.aboutYourself',
            address: '$guideDetails.address',
            city: '$guideDetails.city',
            country: '$guideDetails.country',
            email: '$guideDetails.email',
            mobileNo: '$guideDetails.mobileNo',
            native: '$guideDetails.native',
            picture: '$guideDetails.picture',
            languages: '$guideDetails.languages',
          },
          userDetails: {
            _id: 1,
            fullName: '$userDetails.fullname',
            email: '$userDetails.email',
            profilePicture: '$userDetails.avatar',
          },
        },
      },
    ]);

    if (trips.length === 0) {
      return res.json({ msg: "No packages found" });
    }

    return res.json({ msg: "success", trips });
  } catch (error) {
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};