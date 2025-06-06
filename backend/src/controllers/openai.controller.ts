import { getPopularSongs } from "../services/openai.service";
import catchErrors from "../utils/catchErrors";

export const getPopularSongsHandler = catchErrors(async (req, res) => {
  const { artist } = req.body;

  if (!artist) {
    return res.status(400).json({ error: "artist is required in the request body" });
  }

  try {
    const songsString = await getPopularSongs(artist);

    if (songsString) {
      try {
        const songsArray = JSON.parse(songsString);
        // Manipulating data here to the desired format here because AI takes longer when it has to provide it itself
        const formattedSongs = songsArray.map((song: string) => ({ value: song, label: song }));

        res.status(200).json({ songs: formattedSongs });
      } catch (error) {
        console.error("Error parsing or formatting song list from OpenAI response:", error);
        res.status(500).json({ error: "Failed to process song list from AI" });
      }
    } else {
      res.status(500).json({ error: "Failed to retrieve song list from AI" });
    }
  } catch (error) {
    console.error("Error in /songs route handler:", error);
    res.status(500).json({ error: "Internal server error during song retrieval" });
  }
});
