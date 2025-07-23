import mongoose, { Document, Schema } from 'mongoose';

export interface LocationsdbDocument extends Document {
  locations: string[];
}

/**
 * Helper function to capitalize the first letter of each word,
 * but only if the word's length is greater than one.
 * "monster of a Ronson the One" -> "Monster Of a Ronson The One"
 */
export const capitalizeWords = (text: string): string => {
  if (!text) return '';
  return text.split(' ')
    .map(word => {
      if (word.length <= 1) {
        return word; // Don't capitalize standalone letters
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

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
