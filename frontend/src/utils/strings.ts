export const capitalizeArtistNames = (artistName: string) => {
  if (!artistName) {
    return "";
  }

  const normalizedArtistName = artistName.replace(/\u00A0/g, " "); // Replace non-breaking spaces with regular spaces
  const words = normalizedArtistName.trim().split(/\s+/); // Split by one or more whitespace characters
  const capitalizedWords = words.map(word => {
    if (word.length === 0) return '';
    return word[0].toUpperCase() + word.substring(1).toLowerCase();
  });
  return capitalizedWords.join(" ");
};

/**
 * Capitalizes the first letter of a song name.
 * For subsequent words, it capitalizes the first letter unless
 * the word is a common small word (e.g., "a", "the", "and", "of").
 *
 * @param songName The raw song name string.
 * @returns The capitalized song name.
 */
export const capitalizeSongNames = (songName: string): string => { // Todo: in german names look weird, what to do?
  if (!songName) {
    return "";
  }

  // Defines a set of common "small words" that should generally be lowercase
  const smallWords = new Set([
    "a", "an", "the", "and", "but", "or", "for", "nor", "on", "at", "to", "from", "by", "of", "in", "with", "as", "is",
    "o", "e", //possible in other languages
  ]);

  return songName
    .trim()
    .split(/\s+/)
    .map((word, index) => {
      if (word.length === 0) {
        return "";
      }

      if (index === 0) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }

      if (smallWords.has(word.toLowerCase())) {
        return word.toLowerCase();
      }

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};
