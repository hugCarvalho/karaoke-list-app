import openai from '../config/openai';

/**
 * Fetches a list of popular songs by a given artist using OpenAI.
 * @param artist The artist's name.
 * @returns A promise that resolves to a string (JSON array) of song names, or null on error.
 */
export async function getPopularSongs(artist: string) {
  const prompt = `
    Please list the 25 most popular songs by ${artist}.
    The return value must be a an array of the names of the songs For example: ["No Surprises", "Creep", ...].
    Do NOT include any introductory or concluding text, only the array.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.5,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error(`Error fetching popular songs from OpenAI: ${error}`);
    return null;
  }
}

/**
 * Generates suggestions for a misspelled artist/group name using the OpenAI API.
 * It aims to return exactly 3 suggestions for common misspellings or similar popular names.
 *
 * @param misspelledName The potentially misspelled artist or group name (e.g., "Nivana").
 * @returns A Promise that resolves to an array of 3 suggested correct names (e.g., ["Nirvana", "Aviana", ...]).
 * Returns an empty array if the API call fails or the response cannot be parsed correctly.
 */
export async function suggestArtistName(misspelledName: string): Promise<string[]> {

  const prompt = `
    The following is a potentially misspelled artist or music group name: "${misspelledName}".
    Search for an artist name or group name that is similar to the misspelled name and return ALWAYS one to three suggestions,
    depending on how good the hipothesis are, for the correct spelling or similar popular artist/group names.
    Return the suggestions as a JSON object with a single key "suggestions", whose value is a JSON array of strings.
    Do NOT include any other text, explanation, or formatting outside of this JSON object.

    Example for "nivana": {"suggestions": ["Nirvana", "Aviana", "Nirvana (band)"]}
    Example for "coldply": {"suggestions": ["Coldplay", "Kodaline", "Snow Patrol"]}
    Example for "the bitels": {"suggestions": ["The Beatles", "Beatles", "The Byrds"]}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt },
      ],
      max_tokens: 150, // Should be sufficient for a JSON object containing 3 short strings
      temperature: 0.2, // Lower temperature for more factual and less creative suggestions
      response_format: { type: "json_object" }, // Instructs the model to return a valid JSON object
    });

    const content = response.choices[0].message.content;
    if (content) {
      try {
        const parsedObject = JSON.parse(content);
        // Ensure the parsed object has the 'suggestions' key and it's an array
        if (parsedObject && Array.isArray(parsedObject.suggestions)) {
          // Filter to ensure all elements are strings and limit to max 3
          return parsedObject.suggestions
            .filter((s: any) => typeof s === 'string')
            .slice(0, 3);
        }
      } catch (parseError) {
        console.error(`Error parsing OpenAI response for suggestions (content: "${content}"):`, parseError);
      }
    }
    // Return an empty array if content is null, parsing fails, or the format is incorrect
    return [];
  } catch (apiError) {
    console.error(`Error from OpenAI API during artist suggestion: ${apiError}`);
    return [];
  }
}

/**
 * Generates suggestions for a song name, specifically focusing on correcting typos or finding matches
 * within the context of the provided artist. It prioritizes finding accurate matches
 * for the given artist's discography.
 *
 * This function uses the OpenAI API to analyze the provided song and artist names.
 *
 * @param artist The name of the artist to which the song is associated.
 * @param song The song name, which may be misspelled or potentially an incorrect song for the artist.
 * @returns A Promise that resolves to a string array of suggestions.
 * The array will contain a minimum of 1 and a maximum of 3 suggestions,
 * with the best match always being the first element.
 * Returns an empty array `[]` if the API call fails, the response cannot be parsed,
 * or no relevant suggestions are found by the AI.
 */
export async function suggestSongName(artist: string, song: string): Promise<string[]> {
  const prompt = `
  "${song}" is either:
  A- a potentially misspelled song name.
  B- a song that does not belong to this artist: "${artist}".
  1- Prioritize searching for matches within songs that belong to "${artist}" and
    return ALWAYS a minimum of 1 suggestion and a max of 3 suggestions, depending on how good the hipothesis are.
    Return data as a JSON object with a single key "suggestions",
    whose value is a JSON array with the options, being the first one always the better match.

    Example for case 1, artist is "Nirvana" and song is "litium": {"suggestions": ["Lithium"]} -> it is a typo
    Example for case 1, artist is "Queen" and song is "Under presure": {"suggestions": ["Under Pressure"]} -> it is a typo
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (content) {
      try {
        const parsedObject = JSON.parse(content);
        // TODO: to utils
        if (parsedObject && Array.isArray(parsedObject.suggestions)) {
          return parsedObject.suggestions
            .filter((s: any) => typeof s === 'string')
            .slice(0, 3);
        }
      } catch (parseError) {
        console.error(`Error parsing OpenAI response for suggestions (content: "${content}"):`, parseError);
      }
    }
    return [];
  } catch (apiError) {
    console.error(`Error from OpenAI API during artist suggestion: ${apiError}`);
    return [];
  }
}
