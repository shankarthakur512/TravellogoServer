import Trip from "../models/TripPackage.model.js";
import LocalGuide from "../models/LocalGuide.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";

export const registerTourPackage = async (req, res) => {
//   console.log(req.files)
    try {
    const {createdBy , tripName , Location,  duration, type, hotel , hotelRating , price, status, itinerary, startingDate } = req.body;
    
//   console.log(createdBy)
 
    const localGuideinfo = await LocalGuide.findById(createdBy);
    if (!localGuideinfo) {
      return res.status(404).json({ message: 'Local guide not found' });
    }
    // console.log("Hotel:", hotel);
    // console.log("Hotel Rating:", hotelRating);
    // console.log("Starting Date:", startingDate);
    const parts = startingDate.split('/');
const formattedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    
    console.log(localGuideinfo)
    const photospath = req.files.photos.map(file => file.path);
    let photosUrl = [];

for (const file of photospath) {
    try {
        const photos = await uploadOnCloudinary(file);  // Wait for the upload to finish
        console.log(photos.url);  // Log the URL to the console
        photosUrl.push(photos.url);  // Push the photo URL to the array
    } catch (error) {
        console.error("Error uploading photo:", error);
        // You can handle the error here if needed, e.g., skipping the failed upload
    }
}
 console.log(photosUrl)
    const hoteldetails = {name : hotel , rating : hotelRating}
    const newTrip = new Trip({
      createdBy: localGuideinfo, 
      duration,
      tripName,
      location : Location,
      type,
      hotel : hoteldetails,
      price,
    //   status,
      itinerary,
      startingDate : formattedDate,
      photos : photosUrl,
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
console.log("yha kuch to hai")
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
      // guideDetails: {
      //   Govt_ID: trip.createdBy.Govt_ID,
      //   aboutYourself: trip.createdBy.aboutYourself,
      //   address: trip.createdBy.address,
      //   city: trip.createdBy.city,
      //   country: trip.createdBy.country,
      //   email: trip.createdBy.email,
      //   mobileNo: trip.createdBy.mobileNo,
      //   native: trip.createdBy.native,
      //   picture: trip.createdBy.picture,
      //   languages: trip.createdBy.languages,
      // },
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





