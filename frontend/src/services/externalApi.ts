import { SuggestedSongs } from "../config/types";

//TODO: check try...catch blocks

export const searchMusicBrainzArtist = async (artist: string) => {
  const artistSearchUrl = `https://musicbrainz.org/ws/2/artist/?query=artist:"${encodeURIComponent(artist)}"&fmt=json`;

  try {
    const response = await fetch(artistSearchUrl);
    if (!response.ok) {
      throw new Error(`MusicBrainz artist search API error: ${response.status} - ${response.statusText}`);
    }
    const results = await response.json();

    return { status: "success", data: results };

  } catch (error) {
    console.error("Error querying MusicBrainz Artist API:", error);
    return { status: "error", error: error instanceof Error ? error : new Error(String(error)) };
  }
};

export const isDataVerified = async (song: string, artist: string) => {
  const searchUrl = `https://musicbrainz.org/ws/2/recording/?query=recording:"${encodeURIComponent(song)}" AND artist:"${encodeURIComponent(artist)}"&fmt=json`;
  //1- Checks to see if there is a match in musicbrainz
  try {
    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`MusicBrainz search API error: ${response.status}`);
    }
    const results = await response.json();
    if (results.count > 0) {
      return { status: "success", verified: true, suggestions: [] };
    }

  } catch (error) {
    console.error("Error querying MusicBrainz API:", error);
    return { status: "error", error: error };
  }

  //2- Check if problem is with artist and sugest names
  const artistSearchResult = await searchMusicBrainzArtist(artist);

  if (artistSearchResult.status === "error") {
    return { status: "error", error: artistSearchResult.error };
  }
  // If artist verification fails use AI to suggest a name
  if (artistSearchResult.data.count === 0) {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/openai/ai-artistname-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ unknownArtist: artist }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch songs');
    }
    const { suggestions } = await response.json();

    return { type: "artist", status: "success", verified: false, suggestions };
  }

  //3- Check if problem is with song and sugest names
  const response = await fetch(`${import.meta.env.VITE_API_URL}/openai/ai-songname-suggestions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ artist, song }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch songs');
  }
  const { suggestions } = await response.json();
  return { type: "song", status: "success", verified: false, suggestions };
};

export async function getSongsFromOpenAI(artist: string) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/openai/ai-songs`, {
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

type SongSuggestionsSelectors = { decade: string; genre: string; mood: string; duet: boolean; language: string; }

export async function getSuggestionsFromOpenAI(formData: SongSuggestionsSelectors) {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/openai/ai-songs-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      let errorDetail = 'Failed to fetch songs due to server error.';
      try {
        const errorData = await response.json();
        errorDetail = errorData.error || `Server responded with status ${response.status}.`;
      } catch (jsonError) {
        // If response is not JSON, or empty, use status text
        errorDetail = `Server responded with status ${response.status}: ${response.statusText || 'Unknown error'}.`;
      }
      throw new Error(errorDetail);
    }

    const data: { songs: SuggestedSongs[] | [] } = await response.json();

    return data.songs;

  } catch (error) {
    console.error("Error in getSuggestionsFromOpenAI:", error);
    throw new Error(`Network or API call failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

