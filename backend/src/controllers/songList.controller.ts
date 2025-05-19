// @ts-nocheck
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "../constants/http";
import ArtistdbModel from "../models/artistdb.model";
import List from "../models/song.model";
import UserModel from "../models/user.model";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";

export const addOrUpdateSongHandler = catchErrors(async (req, res) => {
  const artistName = req.body.artist
  const title = req.body.title
  console.log("addOrUpdateSongHandler", req.body.songId)

  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(NOT_FOUND).json({ success: false, message: 'User not found.' });
    }

    // Update the userlists collection
    let list = await List.findOne({ userId: user._id });

    if (!list) {
      list = new List({
        userId: user._id,
        songs: [],
      });
    }

    const existingSong = list.songs.find(
      (song) => song.artist === artistName && song.title === title
    );

    if (Boolean(existingSong)) {
      return res.status(400).json({ success: false, message: 'Song already exists. Use lists instead' });
    }

    list.songs.push(req.body);
    await list.save();

    // Update the artists collection
    let artist = await ArtistdbModel.findOne({ name: artistName });

    if (!artist) {
      artist = new ArtistdbModel({
        name: artistName,
        songs: [title],
      });
      await artist.save();
    } else {
      // $addToSet Adds the song to the artist's songs array avoiding duplicates
      await ArtistdbModel.updateOne({ _id: artist._id }, { $addToSet: { songs: title } });
    }

    await list.save();

    return res.status(OK).json({ success: true, message: 'Song added/updated successfully.' });
  } catch (error: any) {
    console.error('Error adding/updating song:', error);
    return res.status(INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error adding/updating song.', error: error.message });
  }
});

export const addSangSongHandler = catchErrors(async (req, res) => {
  const artistName = req.body.artist
  const title = req.body.title
  console.log("addOrUpdateSongHandler", req.body.songId)

  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(NOT_FOUND).json({ success: false, message: 'User not found.' });
    }

    // Update the userlists collection
    let list = await List.findOne({ userId: user._id });

    if (!list) {
      list = new List({
        userId: user._id,
        songs: [],
      });
    }

    const existingSong = list.songs.find(
      (song) => song.artist === artistName && song.title === title
    );
    console.log('existingSong', existingSong)
    if (Boolean(existingSong)) {
      if (!list.events || list.events.length === 0) {
        // If the events array is empty, create a new event and add the song
        list.events.push({
          // eventId: uuidv4(),
          songs: [{ artist: artistName, name: title }],
        });
      } else {
        // Find an open event
        const openEventIndex = list.events.findIndex(event => !event.closed);

        if (openEventIndex !== -1) {
          // Add the song to the open event's songs array
          list.events[openEventIndex].songs.push({ artist: artistName, name: title });
        } else {
          // Add the song to the last event's songs array
          const lastEventIndex = list.events.length - 1;
          list.events[lastEventIndex].songs.push({ artist: artistName, name: title });
        }
      }

      await list.save();
      updateSongPlayCountHandler(req, res)
    } else {
      list.songs.push(req.body);
      await list.save();

      // Update the artists collection
      let artist = await ArtistdbModel.findOne({ name: artistName });

      if (!artist) {
        artist = new ArtistdbModel({
          name: artistName,
          songs: [title],
        });
        await artist.save();
      } else {
        // $addToSet Adds the song to the artist's songs array avoiding duplicates
        await ArtistdbModel.updateOne({ _id: artist._id }, { $addToSet: { songs: title } });
      }
      //TODO: refactor repeated code
      if (!list.events || list.events.length === 0) {
        // If the events array is empty, create a new event and add the song
        list.events.push({
          // eventId: uuidv4(),
          songs: [{ artist: artistName, name: title }],
        });
      } else {
        // Find an open event
        const openEventIndex = list.events.findIndex(event => !event.closed);

        if (openEventIndex !== -1) {
          // Add the song to the open event's songs array
          list.events[openEventIndex].songs.push({ artist: artistName, name: title });
        } else {
          // Add the song to the last event's songs array
          const lastEventIndex = list.events.length - 1;
          list.events[lastEventIndex].songs.push({ artist: artistName, name: title });
        }
      }
      await list.save();
    }

    return res.status(OK).json({ success: true, message: 'Song added/updated successfully.' });
  } catch (error: any) {
    console.error('Error adding/updating song:', error);
    return res.status(INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error adding/updating song.', error: error.message });
  }
});

export const getSongListHandler = catchErrors(async (req, res) => {
  const user = await UserModel.findById(req.userId);
  appAssert(user, NOT_FOUND, "User not found");

  const list = await List.findOne({ userId: user._id });
  appAssert(list, NOT_FOUND, "List not found");

  return res.status(OK).json(list.songs);
});

export const updateSongHandler = catchErrors(async (req, res) => {
  const { songId, value, type } = req.body as { songId: string, value: boolean, type: "blacklisted" | "fav" | "nextEvent" };
  // const userId = req.user._id;
  console.log('songId', songId, value, type)
  if (!songId || typeof value !== 'boolean') {
    return res.status(400).json({
      status: 400,
      success: false,
      message: 'Invalid request. songId and blacklisted are required.',
    });
  }

  let key = `songs.$.${type}`;
  console.log('key', key)
  const updatedList = await List.findOneAndUpdate(
    // { userId: userId, 'songs.songId': songId },
    { 'songs.songId': songId },
    { $set: { [key]: value } },
    { new: true }
  );

  if (!updatedList) {
    return res.status(404).json({
      status: 404,
      success: false,
      message: 'Song not found.',
    });
  }

  res.status(200).json({
    status: 200,
    success: true,
    message: `${type} status updated successfully`,
    data: updatedList,
  });
});

export const deleteSongHandler = catchErrors(async (req, res) => {
  const songId = req.params.songId;
  const userId = req.userId;
  appAssert(songId, BAD_REQUEST, "SongId not found");

  const deleted = await List.findOneAndUpdate(
    { userId: userId, "songs.songId": songId },
    { $pull: { songs: { songId: songId } } },
    { new: true }
  );
  appAssert(deleted, NOT_FOUND, "Song not found");

  return res.status(OK).json({ message: "Song removed" });
});

export const getArtistsListHandler = catchErrors(async (req, res) => {
  const artists = await ArtistdbModel.find({});
  return res.status(OK).json({ success: true, data: artists });
});


export const updateSongPlayCountHandler = catchErrors(async (req, res) => {
  const songId = req.params.songId;
  const userId = req.userId;
  const currentDate = new Date();

  if (!songId) {
    return res.status(BAD_REQUEST).json({ success: false, message: 'Invalid request. songId is required.' });
  }

  const updatedList = await List.findOneAndUpdate(
    { userId: userId, 'songs.songId': songId },
    {
      $inc: { 'songs.$.plays': 1 },
      $push: {
        'songs.$.events': {
          location: 'Monster Ronson', // Hardcoded for now
          eventDate: currentDate,
        },
      },
    },

    { new: true }
  );

  if (!updatedList) {
    return res.status(NOT_FOUND).json({ success: false, message: 'Song not found.' });
  }

  return res.status(OK).json({ success: true, message: 'Song updated successfully.' });
});

//Events
export const addEventsHandler = catchErrors(async (req, res) => {
  console.log('addEventsHandler', req.body)
  const newEvent = req.body;
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
        events: [], // Initialize events array if it doesn't exist
      });
    }

    // const newEvent = {
    //   id: uuidv4(), // Generate a unique ID for the event (using 'id' as per your schema)
    //   date: new Date(), // Set the current date
    //   closed: false,    // Default to false
    //   songs: [],      // Initialize with an empty array of songs
    // };

    list.events.push(newEvent);
    await list.save();

    return res.status(OK).json({ success: true, message: 'New event created successfully.', event: newEvent });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return res.status(INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error creating event.', error: error.message });
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
      return res.status(OK).json({ success: true, events: [] }); // User has no list, thus no events
    }

    return res.status(OK).json(list.events);

  } catch (error: any) {
    console.error('Error retrieving events:', error);
    return res.status(INTERNAL_SERVER_ERROR).json({ success: false, message: 'Error retrieving events.', error: error.message });
  }
});
