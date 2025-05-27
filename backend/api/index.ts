import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from 'express';
import sanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import OpenAI from "openai";
import connectToDatabase from "../src/config/db";
import { APP_ORIGIN } from "../src/constants/env";
import authenticate from "../src/middleware/authenticate";
import errorHandler from "../src/middleware/errorHandler";
import authRoutes from "../src/routes/auth.route";
import listRoutes from "../src/routes/list.route";
import sessionRoutes from "../src/routes/session.route";
import userRoutes from "../src/routes/user.route";

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "We have received too many requests from this IP. Please try again in one hour."
})
const app = express();

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', APP_ORIGIN);
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie'); // include 'Cookie' if using cookies for credentials
//   res.setHeader('Access-Control-Allow-Credentials', 'true'); // Enable sending credentials

//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(204); // Respond to preflight requests
//   }

//   next();
// });

app.use(cors({
  origin: APP_ORIGIN,
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true, // Enable sending credentials (cookies, authorization headers)
}));

// middleware
app.use(helmet())
app.use(express.urlencoded({ extended: true }))
app.use(express.json({ limit: "10kb" }), sanitize(), hpp())
app.use(cookieParser())
app.use("/", limiter)

const openaiApiKey = process.env.OPENAI_API_KEY
if (!openaiApiKey) {
  throw new Error("Please set the OPENAI_API_KEY environment variable.");
}

const openai = new OpenAI({
  apiKey: openaiApiKey,
});

// auth routes
app.use("/auth", authRoutes)

// protected routes
app.use("/user", authenticate, userRoutes)
app.use("/sessions", authenticate, sessionRoutes)
app.use("/list", authenticate, listRoutes)

//TODO move away these fns
async function getPopularSongs(artist: string) {
  const prompt = `
    Please list the 25 most popular songs by ${artist}.
    The return value must be a an array of the names of the songs For example: ["No surprises", "Creep", ...].
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
    console.error(`Error: ${error}`);
    return null;
  }
}
app.post('/songs', async (req, res) => {
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
        const formattedSongs = songsArray.map(song => ({ value: song, label: song }));

        res.status(200).json({ songs: formattedSongs });
      } catch (error) {
        console.error("Error parsing or formatting song list:", error);
        res.status(500).json({ error: "Failed to process song list" });
      }
    } else {
      res.status(500).json({ error: "Failed to retrieve song list" });
    }
  } catch (error) {
    console.error("Error in /songs route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// error handler
app.use(errorHandler)

async function startServer() {
  await connectToDatabase()

  const port = process.env.PORT || 8080;

  app.get("/healthz", (req, res) => {
    res.status(200).json({ status: "healthy" });
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer()
