import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from "cloudinary";

const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });
    res.json({ success: true, message: "Availability changed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) return res.json({ success: false, message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
      return res.json({ success: true, message: "Appointment Completed" });
    } else {
      return res.json({ success: false, message: "Mark Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
      return res.json({ success: true, message: "Appointment Cancelled" });
    } else {
      return res.json({ success: false, message: "Cancellation Failed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });
    let earnings = 0;
    appointments.map((item) => {
      if (item.isCompleted || item.payment) earnings += item.amount;
    });
    let patients = [];
    appointments.map((item) => {
      if (!patients.includes(item.userId)) patients.push(item.userId);
    });
    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: appointments.reverse().slice(0, 5),
    };
    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    const profileData = await doctorModel.findById(docId).select("-password");
    res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available, about, experience } = req.body;
    const imageFile = req.file;
    const updateData = {
      fees: Number(fees),
      available,
      about,
      experience,
      address: address ? JSON.parse(address) : undefined,
    };
    if (imageFile) {
      const uploaded = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      updateData.image = uploaded.secure_url;
    }
    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);
    await doctorModel.findByIdAndUpdate(docId, updateData);
    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const registerDoctor = async (req, res) => {
  try {
    const { userId, name, email, speciality, degree, experience, about, fees, address, available } = req.body;
    const imageFile = req.file;
    if (!name || !email || !speciality || !degree || !experience || !fees) {
      return res.json({ success: false, message: "Please fill all required fields." });
    }
    const existing = await doctorModel.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "Doctor profile already exists." });
    }
    const userRecord = await userModel.findById(userId);
    if (!userRecord) {
      return res.json({ success: false, message: "User not found." });
    }
    let imageUrl = "";
    if (imageFile) {
      const uploaded = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      imageUrl = uploaded.secure_url;
    }
    const doctorData = {
      name,
      email,
      password: userRecord.password,
      image: imageUrl,
      speciality,
      degree,
      experience,
      about: about || "",
      available: available !== undefined ? available : true,
      fees: Number(fees),
      address: address ? JSON.parse(address) : { line1: "", line2: "" },
      date: Date.now(),
      slots_booked: {},
    };
    const newDoctor = new doctorModel(doctorData);
    const savedDoctor = await newDoctor.save();
    await userModel.findByIdAndUpdate(userId, { doctorId: savedDoctor._id.toString() });
    res.json({ success: true, message: "Doctor profile created.", doctorId: savedDoctor._id });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// ── User-token-based versions (for doctor dashboard using user JWT) ────────────

const doctorProfileByUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const userRecord = await userModel.findById(userId);
    if (!userRecord || !userRecord.doctorId) {
      return res.json({ success: false, message: "Doctor profile not found." });
    }
    const profileData = await doctorModel.findById(userRecord.doctorId).select("-password");
    res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const appointmentsByUser = async (req, res) => {
  try {
    const { userId } = req.body;
    const userRecord = await userModel.findById(userId);
    if (!userRecord || !userRecord.doctorId) {
      return res.json({ success: true, appointments: [] });
    }
    const appointments = await appointmentModel.find({ docId: userRecord.doctorId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updateDoctorProfileByUser = async (req, res) => {
  try {
    const { userId, fees, address, available, about, experience } = req.body;
    const imageFile = req.file;
    const userRecord = await userModel.findById(userId);
    if (!userRecord || !userRecord.doctorId) {
      return res.json({ success: false, message: "Doctor profile not found." });
    }
    const updateData = {
      fees: Number(fees),
      available,
      about,
      experience,
      address: address ? JSON.parse(address) : undefined,
    };
    if (imageFile) {
      const uploaded = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
      updateData.image = uploaded.secure_url;
    }
    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);
    await doctorModel.findByIdAndUpdate(userRecord.doctorId, updateData);
    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const uploadDoctorImage = async (req, res) => {
  try {
    const imageFile = req.file;
    if (!imageFile) return res.json({ success: false, message: "No image provided." });
    const uploaded = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
    res.json({ success: true, imageUrl: uploaded.secure_url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  changeAvailability,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  registerDoctor,
  uploadDoctorImage,
  doctorProfileByUser,
  appointmentsByUser,
  updateDoctorProfileByUser,
};