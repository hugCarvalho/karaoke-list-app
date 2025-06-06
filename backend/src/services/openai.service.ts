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
