import mongoose from 'mongoose';

const eventDataSchema = new mongoose.Schema({
  location: { type: String, default: "" },
  eventDate: { type: Date, default: null },
});

const songSchema = new mongoose.Schema({
  songId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  artist: { type: String, required: true },
  fav: { type: Boolean, default: false },
  blacklisted: { type: Boolean, default: false },
  inNextEventList: { type: Boolean, default: false },
  events: [eventDataSchema],
  plays: { type: Number, default: 1 },
});

const listSchema = new mongoose.Schema(
  {
    songs: [songSchema],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const List = mongoose.model('List', listSchema);

export default List;
