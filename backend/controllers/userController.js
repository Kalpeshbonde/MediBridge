import validator from "validator";
import bycrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import { v2 as cloudinary } from "cloudinary";
import hospitalModel from "../models/hospitalModel.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
import { assertEmail, assertObjectId, assertRequired } from "../utils/validators.js";

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, city, phone } = req.body;

    assertRequired({ name, email, password, city, phone });
    assertEmail(email);
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    // hashing user password
    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
      city,
      phone,
      role: role || "patient",
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1h" });

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
     res.error(error.message, error.status || 500);
  }
};

// API for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bycrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1h" });
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
     res.error(error.message, error.status || 500);
  }
};

// API to get user profile data
const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    assertObjectId(userId, "userId");
    const useData = await userModel.findById(userId).select("-password");
    if (!useData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: useData });
  } catch (error) {
    console.log(error);
     res.error(error.message, error.status || 500);
  }
};

// API to update user profile
const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, dob, gender, address, city } = req.body;

    assertRequired({ userId, name, phone, dob, gender, address });

    const updateData = {
      name,
      phone,
      dob,
      gender,
      city,
      address: typeof address === "string" ? JSON.parse(address) : address,
    };

    Object.keys(updateData).forEach(
      (k) => updateData[k] === undefined && delete updateData[k]
    );

    if (req.file) {
      const existingUser = await userModel.findById(userId).select("imagePublicId");
      if (existingUser?.imagePublicId) {
        await cloudinary.uploader.destroy(existingUser.imagePublicId);
      }
      const uploaded = await uploadBufferToCloudinary(req.file.buffer, "medibridge/users");
      updateData.image = uploaded.secure_url;
      updateData.imagePublicId = uploaded.public_id;
    }

    await userModel.findByIdAndUpdate(userId, updateData);
    return res.json({ success: true, message: "Profile updated." });
  } catch (error) {
    console.log(error);
     return res.error(error.message, error.status || 500);
  }
};

// API to book appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;
    assertObjectId(userId, "userId");
    assertObjectId(docId, "docId");
    const docData = await doctorModel.findById(docId).select("-password");
    if (!docData) {
      return res.status(404).json({ success: false, message: "Doctor not found." });
    }
    if (!docData.available) {
      return res.status(400).json({ success: false, message: "Doctor is not available." });
    }

    const slotsBooked = docData.slots_booked || {};
    if (slotsBooked[slotDate]?.includes(slotTime)) {
      return res.status(409).json({ success: false, message: "This slot is already booked. Please choose another." });
    }

    const updatedSlots = { ...slotsBooked };
    updatedSlots[slotDate] = [...(updatedSlots[slotDate] || []), slotTime];
    await doctorModel.findByIdAndUpdate(docId, { slots_booked: updatedSlots });

    const userData = await userModel.findById(userId).select("-password");

    const { slots_booked, ...docSnapshot } = docData.toObject();
    let hospitalData = null;
    if (docData.hospitalId) {
      hospitalData = await hospitalModel
        .findById(docData.hospitalId)
        .select("-password");
    }

    const appointment = new appointmentModel({
      userId,
      docId,
      slotDate,
      slotTime,
      userData: userData.toObject(),
      docData: docSnapshot,
      city: docData.city || "",
      hospitalId: docData.hospitalId || null,
      hospitalData: hospitalData ? hospitalData.toObject() : null,
      amount: docData.fees,
      date: Date.now(),
    });

    await appointment.save();
    return res.json({ success: true, message: "Appointment booked successfully." });
  } catch (error) {
    console.log(error);
     return res.error(error.message, error.status || 500);
  }
};

// API to get user appointments for frontend my-appointments page
const listAppointments = async (req, res) => {
  try {
    const { userId } = req.body;
    assertObjectId(userId, "userId");
    const appointments = await appointmentModel.find({ userId });

    return res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
     return res.error(error.message, error.status || 500);
  }
};

// API to cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;
    assertObjectId(userId, "userId");
    assertObjectId(appointmentId, "appointmentId");

    const appointment = await appointmentModel.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found." });
    }
    if (appointment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }
    if (appointment.cancelled) {
      return res.status(400).json({ success: false, message: "Appointment is already cancelled." });
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    const { docId, slotDate, slotTime } = appointment;
    const docData = await doctorModel.findById(docId);
    if (docData?.slots_booked?.[slotDate]) {
      const updatedSlots = {
        ...docData.slots_booked,
        [slotDate]: docData.slots_booked[slotDate].filter((t) => t !== slotTime),
      };
      await doctorModel.findByIdAndUpdate(docId, { slots_booked: updatedSlots });
    }

    return res.json({ success: true, message: "Appointment cancelled." });
  } catch (error) {
    console.log(error);
     return res.error(error.message, error.status || 500);
  }
};

export {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointments,
  cancelAppointment,
};
