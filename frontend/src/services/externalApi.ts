
export const isDataVerified = async (songTitle: string, artist: string) => {
  const searchUrl = `https://musicbrainz.org/ws/2/recording/?query=recording:"${encodeURIComponent(songTitle)}" AND artist:"${encodeURIComponent(artist)}"&fmt=json`;

  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`MusicBrainz search API error: ${response.status}`);
    }
    const results = await response.json();

    return { status: "success", verified: results.count > 0 };

  } catch (error) {
    console.error("Error querying MusicBrainz API:", error);
    return { status: "error", error: error };
  }
}

export async function getSongsFromOpenAI(artist: string) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/songs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ artist: artist }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch songs');
  }
  const data = await response.json();
  return data.songs;
}
