import cookieParser from "cookie-parser";
import "dotenv/config";
import express from 'express';
import sanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import connectToDatabase from "../src/config/db";
import { APP_ORIGIN } from "../src/constants/env";
import authenticate from "../src/middleware/authenticate";
import errorHandler from "../src/middleware/errorHandler";
import authRoutes from "../src/routes/auth.routes";
import sessionRoutes from "../src/routes/session.route";
import userRoutes from "../src/routes/user.route";

const limiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "We have received too many requests from this IP. Please try again in one hour."
})
const app = express();

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
app.use(express.json({ limit: "10kb" }), sanitize(), hpp())
app.use(cookieParser())
app.use("/", limiter)

// auth routes
app.use("/auth", authRoutes)

// protected routes
app.use("/user", authenticate, userRoutes)
app.use("/sessions", authenticate, sessionRoutes)

// error handler
app.use(errorHandler)

async function startServer() {
  await connectToDatabase()

  const port = process.env.PORT || 8080;

  app.get("/", (req, res) => {
    res.status(200).json({ status: "healthy" });
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

startServer()
