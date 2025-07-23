import mongoose, { Document, Schema } from 'mongoose';
import { capitalizeWords } from '../utils/strings';

export interface LocationsdbDocument extends Document {
  locations: string[];
}

const LocationsdbSchema: Schema = new Schema({
  locations: {
    required: true,
    type: [String],
    default: [],
    index: true, // Keep index for potential future query patterns or large array optimizations
    set: (v: string[]) => {
      if (!v) return [];

      // 1. Trim whitespace from each string
      // 2. Apply custom capitalization
      // 3. Filter out any resulting empty strings
      const processedLocations = v.map(loc => capitalizeWords(loc.trim())).filter(loc => loc !== '');

      // 4. Ensure uniqueness using a Set
      return Array.from(new Set(processedLocations));
    },
  },
}, { timestamps: true });

const LocationdbModel = mongoose.model<LocationsdbDocument>('Location', LocationsdbSchema);

export default LocationdbModel;
