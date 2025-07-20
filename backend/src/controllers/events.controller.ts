import { INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "../constants/http";
import List from "../models/song.model";
import UserModel from "../models/user.model";
import catchErrors from "../utils/catchErrors";
//Events
export const addEventsHandler = catchErrors(async (req, res) => {
  const newEvent = {
    location: "Monster Ronson",
    eventDate: Date.now(),
    songs: [],
    closed: false,
  };

  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(NOT_FOUND).json({ success: false, message: 'User not found.' });
    }

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
