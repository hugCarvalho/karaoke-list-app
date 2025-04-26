// @ts-nocheck
import { BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND, OK } from "../constants/http";
import List from "../models/song.model";
import UserModel from "../models/user.model";
import appAssert from "../utils/appAssert";
import catchErrors from "../utils/catchErrors";

export const addSongHandler = catchErrors(async (req, res) => {
  const user = await UserModel.findById(req.userId)
  appAssert(user, NOT_FOUND, "User not found")
  return res.status(OK).json(user.omitPassword())
})

export const addOrUpdateSongHandler = catchErrors(async (req, res) => {
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
      });
    }

    list.songs.push(req.body);

    await list.save();

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
