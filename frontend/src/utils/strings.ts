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
