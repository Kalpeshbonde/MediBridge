import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";
import caremateRouter from "./routes/caremateRoute.js"; // ✅ NEW LINE

// app config
const app = express();
const port = process.env.PORT || 4000;

// middlewares
app.use(express.json());
app.use(cors());

// api endpoints
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);
app.use("/api/caremate", caremateRouter); // ✅ NEW LINE

app.get("/", (req, res) => {
  res.send("API WORKING");
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
