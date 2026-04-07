import { OK } from "../constants/http";
import { getPopularSongsForArtist, searchForInspiration, suggestArtistName, suggestSongName } from "../services/openai.service";
import catchErrors from "../utils/catchErrors";

//TODO: improve typing

export const getPopularSongsHandler = catchErrors(async (req, res) => {
  const { artist } = req.body;

  if (!artist) {
    return res.status(400).json({ error: "Artist is required" });
  }

  try {
    const songsString = await getPopularSongsForArtist(artist);

    if (!songsString) {
      return res.status(500).json({ error: "No response from AI" });
    }

    // 1. Parse the string into an object
    const parsedData = JSON.parse(songsString);

    // 2. Safely extract the array.
    // We check for .songs (what we asked for) or .list just in case.
    const songsArray = Array.isArray(parsedData)
      ? parsedData
      : (parsedData.songs || parsedData.list || []);

    // 3. Check if we actually got an array to map over
    if (!Array.isArray(songsArray)) {
      console.error("AI did not return an array. Data received:", parsedData);
      return res.status(500).json({ error: "AI returned invalid data format" });
    }

    // 4. Map the data for the frontend
    const formattedSongs = songsArray.map((song: string) => ({
      value: song,
      label: song
    }));

    res.status(200).json({ songs: formattedSongs });

  } catch (error) {
    console.error("Detailed Error in getPopularSongsHandler:", error);
    res.status(500).json({ error: "Internal server error during song retrieval" });
  }
});

export const getNameSuggestionHandler = catchErrors(async (req, res) => {
  // Assuming the misspelled artist name comes in the request body under 'misspelledArtist'
  const { unknownArtist } = req.body;

  // Call the service function to get suggestions from OpenAI
  const suggestions = await suggestArtistName(unknownArtist);

  // The suggestArtistName function already handles errors internally by returning an empty array
  // in case of API failure or parsing issues. So, we simply return the collected suggestions.
  return res.status(OK).json({ suggestions });
});

export const getSongNameSuggestionHandler = catchErrors(async (req, res) => {
  const { song, artist } = req.body;

  const suggestions = await suggestSongName(artist, song);

  return res.status(OK).json({ suggestions });
});


export const getSongSuggestionsHandler = catchErrors(async (req, res) => {
  const { decade, genre, mood, duet, language } = req.body;
  const allFieldsAreEmpty = !decade && !genre && !mood && !language && !duet;

  if (allFieldsAreEmpty) {
    return res.status(400).json({ error: "At least one field must be chosen!" });
  }

  try {
    const songs = await searchForInspiration(decade, genre, language, mood, duet);

    try {
      const parsedResponse = JSON.parse(songs);

      // Ensure parsedResponse is an object and has a 'songs' array property
      if (typeof parsedResponse !== 'object' || parsedResponse === null || !Array.isArray(parsedResponse.songs)) {
        console.error("OpenAI response content is not in the expected { 'songs': [] } format:", parsedResponse);
        return res.status(500).json({ error: "AI response format invalid or missing songs list." });
      }

      res.status(OK).json(parsedResponse);
    } catch (parseError) {
      console.error("Error parsing song list JSON from OpenAI response:", parseError);
      res.status(500).json({ error: "Failed to process song list from AI: Invalid JSON response." });
    }
  } catch (apiCallError) {
    console.error("Error in /songs route handler (OpenAI API call failed):", apiCallError);
    res.status(500).json({ error: `Internal server error during song suggestion retrieval: ${apiCallError instanceof Error ? apiCallError.message : String(apiCallError)}` });
  }
});
