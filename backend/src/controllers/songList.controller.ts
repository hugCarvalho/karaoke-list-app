// @ts-nocheck
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "../constants/http";
import ArtistdbModel from "../models/artistdb.model";
import List from "../models/song.model";
import UserModel from "../models/user.model";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";

const updateSongPlayCount = async (userId: string, songId: string) => {
  const currentDate = Date.now();

  const updatedList = await List.findOneAndUpdate(
    { userId: userId, 'songs.songId': songId },
    {
      $inc: { 'songs.$.plays': 1 },
      $push: {
        'songs.$.events': {
          location: 'Monster Ronson', // Hardcoded for now
          eventDate: new Date(currentDate),
        },
      },
    },
    { new: true }
  );

  if (!updatedList) {
    throw { status: NOT_FOUND, message: 'Song not found in the list.' };
  }

  return updatedList;
};

const updateEventsList = async (userId: string, artistName: string, title: string) => {
  const list = await List.findOne({ userId: userId });

  if (!list) {
    throw { status: NOT_FOUND, message: 'List not found.' };
  }

  if (!list.events || list.events.length === 0) {
    list.events.push({
      songs: [{ artist: artistName, name: title }],
    });
  } else {
    const openEventIndex = list.events.findIndex(event => !event.closed);

    if (openEventIndex !== -1) {
      list.events[openEventIndex].songs.push({ artist: artistName, name: title });
    } else {
      const lastEventIndex = list.events.length - 1;
      list.events[lastEventIndex].songs.push({ artist: artistName, name: title });
    }
  }

  await list.save();
  return list;
};

export const addOrUpdateSongHandler = catchErrors(async (req, res) => {
  const artistName = req.body.artist
  const title = req.body.title

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
      updateSongPlayCount(user._id, req.body.songId)
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

  if (!songId || typeof value !== 'boolean') {
    return res.status(400).json({
      status: 400,
      success: false,
      message: 'Invalid request. songId and blacklisted are required.',
    });
  }

  let key = `songs.$.${type}`;
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

export const deleteSongFromCurrentEventHandler = catchErrors(async (req, res) => {
  const songId = req.params.songId;
  const userId = req.userId;
  appAssert(songId, BAD_REQUEST, "Song ID is required.");

  //Info: List.updateOne is better than List.findOneAndUpdate when no return data is needed, it is more performant
  const result = await List.updateOne(
    {
      userId: userId,
      "events.closed": false,
      // OPTIONAL IMPROVEMENT: Pre-filter to ensure the song exists within that event's songs array.
      // This makes `matchedCount` more precise.
      "events.songs._id": songId
    },
    {
      $pull: {
        "events.$.songs": { _id: songId }
      }
    }
  );

  // Error Handling based on updateOne result
  if (result.matchedCount === 0) {
    // This means no List document was found that met all query criteria.
    appAssert(false, NOT_FOUND, "List or current open event not found, or song does not exist within any event.");
  }

  if (result.modifiedCount === 0) {
    // This means a List document was matched, but the $pull operation didn't modify it.
    appAssert(false, NOT_FOUND, "Song not found in the current event's specific song list, or already removed.");
  }

  return res.status(OK).json({ message: "Song successfully removed from current event's list." });
})

export const getArtistsListHandler = catchErrors(async (req, res) => {
  const artists = await ArtistdbModel.find({});
  return res.status(OK).json({ success: true, data: artists });
});

export const updateSongPlayCountHandler = catchErrors(async (req, res) => {
  const songId = req.params.songId;
  const userId = req.userId;
  const currentDate = Date.now();
  const artistName = req.body.artist;
  const title = req.body.title;

  if (!songId || !artistName || !title) {
    return res.status(BAD_REQUEST).json({
      success: false,
      message: 'Invalid request. songId, artist, and title are required.',
    });
  }

  try {
    const list = await List.findOne({ userId: userId });

    if (!list) {
      return res.status(NOT_FOUND).json({ success: false, message: 'List not found.' });
    }

    // Find the song within the list and update play count and events
    const songToUpdate = list.songs.find(song => song.songId === songId);

    if (songToUpdate) {
      songToUpdate.plays = (songToUpdate.plays || 0) + 1;
      songToUpdate.events.push({
        location: 'Monster Ronson', // Hardcoded for now
        eventDate: new Date(currentDate),
      });

      // Add Event to Events List
      if (!list.events || list.events.length === 0) {
        list.events.push({
          songs: [{ artist: artistName, name: title }],
        });
      } else {
        const openEventIndex = list.events.findIndex(event => !event.closed);

        if (openEventIndex !== -1) {
          list.events[openEventIndex].songs.push({ artist: artistName, name: title });
        } else {
          const lastEventIndex = list.events.length - 1;
          list.events[lastEventIndex].songs.push({ artist: artistName, name: title });
        }
      }

      await list.save();
      return res.status(OK).json({ success: true, message: 'Song updated successfully.' });
    } else {
      return res.status(NOT_FOUND).json({ success: false, message: 'Song not found in the list.' });
    }
  } catch (error: any) {
    console.error('Error updating song play count and events:', error);
    return res.status(INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Error updating song.',
      error: error.message,
    });
  }
});
