import mongoose from 'mongoose'; // Import mongoose to use mongoose.Types.ObjectId
import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "../constants/http";
import LocationdbModel, { capitalizeWords } from '../models/locationsdb.model';
import List from "../models/song.model";
import UserModel from "../models/user.model";
import catchErrors from "../utils/catchErrors";

// Define the fixed ObjectId for your single locations document
// THIS MUST MATCH THE _id OF YOUR EXISTING DOCUMENT IN MONGODB
const GLOBAL_LOCATIONS_DOC_ID = '6880de557f8a8353cd266150';

export const addEventsHandler = catchErrors(async (req, res) => {
  const { location: rawLocation } = req.body;

  if (!rawLocation || typeof rawLocation !== 'string' || rawLocation.trim() === '') {
    return res.status(400).json({ success: false, message: 'Location is required.' });
  }

  const processedLocation = capitalizeWords(rawLocation.trim());

  const newEvent = {
    location: processedLocation,
    eventDate: Date.now(),
    songs: [],
    closed: false,
  };

  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(NOT_FOUND).json({ success: false, message: 'User not found.' });
    }

    // Update the locations document
    // We are now targeting the existing ObjectId directly
    await LocationdbModel.updateOne(
      { _id: new mongoose.Types.ObjectId(GLOBAL_LOCATIONS_DOC_ID) }, // Use the actual ObjectId
      { $addToSet: { locations: processedLocation } },
    );

    let list = await List.findOne({ userId: user._id });

    if (!list) {
      list = new List({
        userId: user._id,
        songs: [],
        events: [],
      });
    }

    list.events.push(newEvent);
    await list.save();

    return res.status(OK).json({ success: true, message: 'New event created successfully.', event: newEvent });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return res.status(INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error creating event.', error: error.message });
  }
});

export const closeEventsHandler = catchErrors(async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(NOT_FOUND).json({ success: false, message: 'User not found.' });
    }

    let list = await List.findOne({ userId: user._id });

    if (!list) {
      return res.status(NOT_FOUND).json({ success: false, message: 'List not found.' });
    }

    const openEventIndex = list.events.findIndex(event => !event.closed);

    if (openEventIndex === -1) {
      return res.status(NOT_FOUND).json({ success: false, message: 'No open event found to close.' });
    }

    list.events[openEventIndex].closed = true;

    await list.save();

    return res.status(OK).json({ success: true, message: 'Event successfully closed.' });
  } catch (error: any) {
    console.error('Error closing event:', error);
    return res.status(INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error closing event.', error: error.message });
  }
});

export const getEventsListHandler = catchErrors(async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(NOT_FOUND).json({ success: false, message: 'User not found.' });
    }

    const list = await List.findOne({ userId: user._id });

    if (!list) {
      return res.status(OK).json(null);
    }

    return res.status(OK).json(list.events);

  } catch (error: any) {
    console.error('Error retrieving events:', error);
    return res.status(INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error retrieving events.', error: error.message });
  }
});

export const getLocationsHandler = catchErrors(async (req, res) => {
  try {
    // Find the single document containing all locations
    // Cast the string ID to a Mongoose ObjectId
    const locationsDoc = await LocationdbModel.findById(
      new mongoose.Types.ObjectId(GLOBAL_LOCATIONS_DOC_ID)
    );

    // If the document is not found, it means the global locations list hasn't been initialized yet.
    // In this case, return an empty array.
    if (!locationsDoc) {
      console.warn(`Global locations document with ID ${GLOBAL_LOCATIONS_DOC_ID} not found. Returning empty array.`);
      return res.status(OK).json([]);
    }

    // Return the locations array
    return res.status(OK).json(locationsDoc.locations);

  } catch (error: any) {
    console.error('Error retrieving locations:', error);
    // Return an internal server error if something goes wrong during retrieval
    return res.status(INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error retrieving locations.', error: error.message });
  }
});
