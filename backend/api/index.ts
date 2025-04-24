import cookieParser from "cookie-parser";
import "dotenv/config";
import express, { Request, Response } from 'express';
import sanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import { APP_ORIGIN } from "../src/constants/env";
import authRoutes from "../src/routes/auth.routes";

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "We have received too many requests from this IP. Please try again in one hour."
})
const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', APP_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie'); // include 'Cookie' if using cookies for credentials
  res.setHeader('Access-Control-Allow-Credentials', 'true'); // Enable sending credentials

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204); // Respond to preflight requests
  }

  next();
});

// middleware
app.use(helmet())
app.use(express.urlencoded({ extended: true }))
app.use(express.json({limit: "10kb"}), sanitize(), hpp())
app.use(cookieParser())
app.use("/", limiter)

// auth routes
app.use("/auth", authRoutes)

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, TypeScript Node.js Backend!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
