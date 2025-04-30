import mongoose, { Document, Schema } from 'mongoose';

export interface ArtistdbDocument extends Document {
  name: string;
  songs: string[];
}

const ArtistdbSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  songs: {
    type: [String],
    default: [],
  },
}, { timestamps: true });

const ArtistdbModel = mongoose.model<ArtistdbDocument>('Artist', ArtistdbSchema);

export default ArtistdbModel;
