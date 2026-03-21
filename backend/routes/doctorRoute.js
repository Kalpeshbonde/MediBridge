import express from "express";
import {
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  registerDoctor,
  uploadDoctorImage,
  doctorProfileByUser,
  appointmentsByUser,
  updateDoctorProfileByUser,
} from "../controllers/doctorController.js";
import authDoctor from "../middlewares/authDoctor.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const doctorRouter = express.Router();

doctorRouter.get("/list", doctorList);
doctorRouter.post("/login", loginDoctor);

doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.post("/update-profile", authDoctor, upload.single("image"), updateDoctorProfile);

doctorRouter.post("/register", upload.single("image"), authUser, registerDoctor);
doctorRouter.post("/upload-image", upload.single("image"), authUser, uploadDoctorImage);
doctorRouter.get("/profile-by-user", authUser, doctorProfileByUser);
doctorRouter.get("/appointments-by-user", authUser, appointmentsByUser);
doctorRouter.post("/update-profile-by-user", upload.single("image"), authUser, updateDoctorProfileByUser);

export default doctorRouter;