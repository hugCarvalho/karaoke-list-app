import OpenAI from "openai";

const openaiApiKey = process.env.OPENAI_API_KEY;

if (!openaiApiKey) {
  throw new Error("Please set the OPENAI_API_KEY environment variable.");
}

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

export default openai;
