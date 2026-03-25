import mongoose from "mongoose";
import { env } from "../utils/env.js";

const connectDB = async () => {
  const mongoUri = env.MONGODB_URI;
  const dbName = env.MONGODB_DB_NAME;

  if (!mongoUri) {
    throw new Error("Missing MONGODB_URI in backend/.env");
  }

  if (!mongoUri.startsWith("mongodb://") && !mongoUri.startsWith("mongodb+srv://")) {
    throw new Error("Invalid MONGODB_URI format. Use mongodb:// or mongodb+srv://");
  }

  mongoose.connection.on("connected", () => console.log("Database Connected"));

  await mongoose.connect(mongoUri, { dbName });
};

export default connectDB;
