import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import caremateRouter from "./routes/caremateRoute.js"; // ✅ NEW LINE
import hospitalRouter from "./routes/hospitalRoute.js";
import rateLimit from "express-rate-limit";
import { env } from "./utils/env.js";
import { responseHelpers } from "./utils/responses.js";

// app config
const app = express();
const port = env.PORT;

const allowedOrigins = (env.ALLOWED_ORIGINS || "").split(",").map((o) => o.trim()).filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  credentials: true,
  optionsSuccessStatus: 204,
};

const generalLimiter = rateLimit({
  windowMs: Number(env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(env.RATE_LIMIT_MAX || 500),
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: Number(env.RATE_LIMIT_AUTH_WINDOW_MS || 10 * 60 * 1000),
  max: Number(env.RATE_LIMIT_AUTH_MAX || 50),
  standardHeaders: true,
  legacyHeaders: false,
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

// middlewares
app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: env.BODY_LIMIT }));
app.use(express.urlencoded({ limit: env.BODY_LIMIT, extended: true }));
app.use(cors(corsOptions));
app.use(responseHelpers);
app.use(generalLimiter);

// api endpoints
app.use("/api/doctor", authLimiter, doctorRouter);
app.use("/api/user", authLimiter, userRouter);
app.use("/api/caremate", chatLimiter, caremateRouter); // ✅ rate-limited chat
app.use("/api/hospital", authLimiter, hospitalRouter);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

// centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  if (typeof res.error === "function") {
    return res.error(err.message || "Server error", status);
  }
  res.status(status).json({ success: false, message: err.message || "Server error" });
});

const startServer = async () => {
  try {
    await connectDB();
    await connectCloudinary();

    app.listen(port, () => console.log("Server started", port));
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
