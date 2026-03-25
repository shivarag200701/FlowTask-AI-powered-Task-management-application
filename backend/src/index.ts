import dotenv from "dotenv";
// Load environment variables first, before any other imports that depend on process.env
dotenv.config();

import express from "express";
import cors from "cors";
import userRouter from "./routes/user.js";
import todoRouter from "./routes/todo.js";
import { createClient } from "redis";
import { RedisStore } from "connect-redis";
import session from "express-session";
import { requireLogin } from "./middleware.js";
import { processRecurringTasks } from "./utils/recurringTasks.js";
import cron from "node-cron";
import oauthRouter from "./routes/oauth.js";
import QueueService from "./services/notification/QueueService.js";

const app = express();
const redisConnectionString = process.env.REDIS_URL || "";
const secretString = process.env.SESSION_SECRET || "";

// Get environment variables
export const NODE_ENV = process.env.NODE_ENV || "development";
const FRONTEND_URL = (
  process.env.FRONTEND_URL || "http://localhost:5173"
).replace(/\/$/, "");
const PORT = process.env.PORT || 3000;

//redis client
export const redisClient = createClient({
  url: redisConnectionString,
});

//create queue as a singlelton
export const queueService = new QueueService();

//creating store for client to talk with session
const redisStore = new RedisStore({
  client: redisClient,
  prefix: "session:",
});

redisClient
  .connect()
  .catch((error) => console.error("unable to connect to redis client", error));

redisClient.on("connect", () =>
  console.log("connected to railway redis client"),
);
redisClient.on("error", (error) =>
  console.error("Error connecting to redis client", error),
);

//cors
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      // Normalize origin by removing trailing slash
      const normalizedOrigin = origin.replace(/\/$/, "");
      const normalizedFrontendUrl = FRONTEND_URL.replace(/\/$/, "");

      // Check if origin matches (with or without trailing slash)
      if (
        normalizedOrigin === normalizedFrontendUrl ||
        origin === FRONTEND_URL
      ) {
        callback(null, true);
      } else {
        console.error(
          `CORS blocked origin: ${origin}, expected: ${FRONTEND_URL}`,
        );
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//session middleware
app.use(
  session({
    store: redisStore,
    secret: secretString,
    resave: false,
    saveUninitialized: false, // Change to true - this will create session even if not modified
    name: "connect.sid", // Explicitly set cookie name
    cookie: {
      secure: NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      sameSite: "lax",
      domain: NODE_ENV === "production" ? ".shiva-raghav.com" : undefined,
    },
  }),
);

//json parser
app.use(express.json());

//routes
app.get("/v1/auth-check", (req, res) => {
  if (req.session?.userId) {
    res.status(200).json({ isAuthenticated: true, email: req.session.email });
  } else {
    res.status(200).json({ isAuthenticated: false });
  }
});

app.use("/v1/user", userRouter);
app.use("/v1/todo", todoRouter);
app.use("/v1/oauth", oauthRouter);
app.listen(PORT, () => {
  console.log(`running in port ${PORT}`);
  console.log("Queue service initialized");
});

export default app;
