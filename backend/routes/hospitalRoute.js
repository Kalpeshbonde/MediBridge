import express from "express";
import {
  registerHospital,
  loginHospital,
  getHospitalProfile,
  updateHospitalProfile,
  listHospitalDoctors,
  linkDoctorToHospital,
  unlinkDoctorFromHospital,
  getHospitalById,
} from "../controllers/hospitalController.js";
import authHospital from "../middlewares/authHospital.js";
import upload from "../middlewares/multer.js";

const hospitalRouter = express.Router();

hospitalRouter.post("/register", registerHospital);
hospitalRouter.post("/login", loginHospital);

hospitalRouter.get("/profile", authHospital, getHospitalProfile);
hospitalRouter.post(
  "/update-profile",
  authHospital,
  upload.single("logo"),
  updateHospitalProfile
);

hospitalRouter.get("/doctors", authHospital, listHospitalDoctors);
hospitalRouter.post("/link-doctor", authHospital, linkDoctorToHospital);
hospitalRouter.post("/unlink-doctor", authHospital, unlinkDoctorFromHospital);

hospitalRouter.get("/:hospitalId", getHospitalById);

export default hospitalRouter;
