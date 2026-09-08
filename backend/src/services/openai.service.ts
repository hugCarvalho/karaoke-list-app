import Groq from "groq-sdk";

// Initialize with your API Key (Add GROQ_API_KEY to your backend .env)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// const apiModel = 'openai/gpt-oss-20b'
const apiModel = 'openai/gpt-oss-20b'
/**
 * Fetches a list of popular songs by a given artist using OpenAI.
 * @param artist The artist's name.
 * @returns A promise that resolves to a string (JSON array) of song names, or null on error.
 */


export async function getPopularSongsForArtist(artist: string) {
  console.log("------------RUNNING GROK ------------------")
  try {
    const chatCompletion = await groq.chat.completions.create({
      // apiModel is the current 2026 workhorse for Groq
      messages: [
        {
          role: "system",
          content: "You are a music database. Respond only with a JSON array of strings containing song titles. No prose, no markdown blocks."
        },
        {
          role: "user",
          content: `List the 10 most popular songs by ${artist}. Return a JSON object with a 'songs' key containing an array of strings.`
        }
      ],
      model: apiModel,
      // Setting temperature to 0 makes the list more consistent/factual
      temperature: 0,
      // Ensure the model knows we want JSON
      response_format: { type: "json_object" }
    });

    const content = chatCompletion.choices[0]?.message?.content;
    console.log("CONNTENT:", content)
    if (!content) {
      throw new Error("Groq returned an empty response.");
    }

    return content;
  } catch (error) {
    console.error(`Groq API Error: ${error}`);
    throw new Error(`Failed to fetch songs for ${artist} via Groq.`);
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
Search for an artist name or band name, whose names are phonetically/spelling-wise similar to the misspelled name and return ALWAYS one to three suggestions for the correct spelling.
Return the suggestions as a JSON object with a single key "suggestions", whose value is a JSON array of strings.
Do NOT include any other text, explanation, or formatting outside of this JSON object.

Example for "nivana": {"suggestions": ["Nirvana", "Aviana", "Nirvana (band)"]}
Example for "coldply": {"suggestions": ["Coldplay", "Kodaline", "Snow Patrol"]}
Example for "the bitels": {"suggestions": ["The Beatles", "Beatles", "The Byrds"]}
  `;

  try {
    const response = await groq.chat.completions.create({
      model: apiModel,
      messages: [
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;

    if (content) {
      try {
        const parsedObject = JSON.parse(content);

        // Ensure the parsed object has the 'suggestions' key and it's an array
        if (parsedObject && Array.isArray(parsedObject.suggestions)) {
          return parsedObject.suggestions
            .filter((s: any) => typeof s === 'string')
            .slice(0, 3);
        }
      } catch (parseError) {
        console.error(`Error parsing Groq response for suggestions (content: "${content}"):`, parseError);
      }
    }
    return [];
  } catch (apiError) {
    console.error(`Error from Groq API during artist suggestion: ${apiError}`);
    throw new Error(`Groq API call failed for artist suggestion: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
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

Task:
1- Prioritize searching for matches within songs that belong to "${artist}".
2- Return ALWAYS a minimum of 1 suggestion and a max of 3 suggestions.
3- Return data as a JSON object with a single key "suggestions", whose value is a JSON array.
4- The first element must always be the best match.

Examples:
- Artist "Nirvana", Song "litium": {"suggestions": ["Lithium"]}
- Artist "Queen", Song "Under presure": {"suggestions": ["Under Pressure"]}
  `;

  try {
    const response = await groq.chat.completions.create({
      model: apiModel,
      messages: [
        {
          role: "system",
          content: "You are a music database assistant. You must only output valid JSON."
        },
        {
          role: "user",
          content: prompt
        },
      ],
      max_tokens: 150,
      temperature: 0.2, // Low temperature is perfect here for factual corrections
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;

    if (content) {
      try {
        const parsedObject = JSON.parse(content);

        // Safety check for the 'suggestions' key
        if (parsedObject && Array.isArray(parsedObject.suggestions)) {
          return parsedObject.suggestions
            .filter((s: any) => typeof s === 'string')
            .slice(0, 3);
        }
      } catch (parseError) {
        console.error(`Error parsing Groq response for song suggestions (content: "${content}"):`, parseError);
      }
    }
    return [];
  } catch (apiError) {
    console.error(`Error from Groq API during song name suggestion: ${apiError}`);
    throw new Error(`Groq API call failed for song name suggestion: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
  }
}
/**
 * Generates a list of popular karaoke song suggestions based on specified criteria
 * using the OpenAI API. The function constructs a prompt to guide the AI in
 * selecting songs that match the provided decade, genre, language, mood, and duet preference.
 *
 * The AI is instructed to return results in a strict JSON format containing an array of song objects.
 *
 * @param decade - The decade to filter songs by (e.g., "90's", "2000"). Can be an empty string if not specified.
 * @param genre - The musical genre to filter songs by (e.g., "Rock", "Pop"). Can be an empty string if not specified.
 * @param language - The language of the songs (e.g., "English", "Spanish"). Can be an empty string if not specified.
 * @param mood - The mood of the songs (e.g., "Happy", "Melancholic"). Can be an empty string if not specified.
 * @param isDuet - A boolean indicating whether the songs should have at least two main vocals.
 * @returns A Promise that resolves to a JSON string containing an array of song objects.
 * The format is `{"songs": [{"artist": "...", "title": "...", "year": ...}, ...]}`.
 * Returns `{"songs": []}` as a JSON string if no songs are found by the AI.
 * Returns an empty string `""` if the API call fails or the response cannot be retrieved/processed.
 * Note: The `Promise<string>` return type reflects the raw JSON string content from OpenAI.
 */
export async function searchForInspiration(
  decade: string,
  genre: string,
  language: string,
  mood: string,
  isDuet: boolean
): Promise<string> {

  const prompt = `
I need songs to sing at karaoke. Search for 15 popular songs that match:
${decade ? `Decade: ${decade}, ` : ""}
${genre ? `Genre: ${genre}, ` : ""}
${language ? `Language: ${language}, ` : ""}
${mood ? `Mood: ${mood}, ` : ""}
${isDuet ? "The song MUST be a duet (has at least two main vocals)" : ""}.

Return the songs as a JSON object with the following structure:
{
  "songs": [
    {"artist": "Artist Name", "title": "Song Title", "year": 1990},
    ...
  ]
}
If no songs are found, return { "songs": [] }.
Do not return any explanation or extra text.
`;

  try {
    const response = await groq.chat.completions.create({
      // Using 70B here is better for "Inspiration" because it has a
      // deeper knowledge of obscure songs than the 8B model.
      model: apiModel,
      messages: [
        {
          role: "system",
          content: "You are a professional Karaoke DJ. You only respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        },
      ],
      max_tokens: 800, // Increased slightly to accommodate 15 full objects
      temperature: 0.9, // Kept high for variety in suggestions
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error("Groq returned an empty response.");
    }

    return content;
  } catch (apiError) {
    console.error(`Error from Groq API during inspiration search: ${apiError}`);
    throw new Error(`Groq API call failed: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
  }
}
