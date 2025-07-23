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
