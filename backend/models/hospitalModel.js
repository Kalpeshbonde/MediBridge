import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    city: { type: String, required: true },
    description: { type: String, default: "" },
    logo: { type: String, default: "" },
    logoPublicId: { type: String, default: "" },
  },
  { timestamps: true }
);

const hospitalModel =
  mongoose.models.hospital || mongoose.model("hospital", hospitalSchema);

export default hospitalModel;
