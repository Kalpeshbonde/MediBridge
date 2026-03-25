import express from "express";
import multer from "multer";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointments,
  cancelAppointment,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import requireRole from "../middlewares/requireRole.js";

const userRouter = express.Router();

const storage = multer.diskStorage({});
const upload = multer({ storage });

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

userRouter.get("/get-profile", authUser, getProfile);
userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateProfile
);
userRouter.post("/book-appointment", authUser, requireRole(["patient"]), bookAppointment);
userRouter.get("/appointments", authUser, requireRole(["patient"]), listAppointments);
userRouter.post("/cancel-appointment", authUser, requireRole(["patient"]), cancelAppointment);

export default userRouter;
