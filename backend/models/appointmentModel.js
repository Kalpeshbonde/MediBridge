import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId      : { type: String,  required: true },
  docId       : { type: String,  required: true },
  slotDate    : { type: String,  required: true },   // format: "D_M_YYYY"
  slotTime    : { type: String,  required: true },   // format: "10:00 AM"
  userData    : { type: Object,  required: true },   // snapshot at booking time
  docData     : { type: Object,  required: true },   // snapshot at booking time
  city        : { type: String,  default: "" },
  hospitalId  : { type: String,  default: null },
  hospitalData: { type: Object,  default: null },
  amount      : { type: Number,  required: true },
  date        : { type: Number,  required: true },   // Date.now() timestamp
  cancelled   : { type: Boolean, default: false },
  payment     : { type: Boolean, default: false },
  isCompleted : { type: Boolean, default: false },
});

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

export default appointmentModel;