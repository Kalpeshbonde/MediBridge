import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import hospitalModel from "../models/hospitalModel.js";
import doctorModel from "../models/doctorModel.js";
import { assertEmail, assertObjectId, assertRequired } from "../utils/validators.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

const registerHospital = async (req, res) => {
  try {
    const { name, email, password, city, description } = req.body;
    assertRequired({ name, email, password, city });
    assertEmail(email);
    if (password.length < 8) {
      return res.error("Password must be at least 8 characters", 400);
    }

    const existing = await hospitalModel.findOne({ email });
    if (existing) {
      return res.error("Hospital already exists", 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const hospital = await hospitalModel.create({
      name,
      email,
      password: hashedPassword,
      city,
      description: description || "",
    });

    const token = jwt.sign({ id: hospital._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1h" });
    return res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    return res.error(error.message, error.status || 500);
  }
};

const loginHospital = async (req, res) => {
  try {
    const { email, password } = req.body;
    assertRequired({ email, password });
    assertEmail(email);
    const hospital = await hospitalModel.findOne({ email });
    if (!hospital) {
      return res.error("Invalid credentials", 401);
    }

    const isMatch = await bcrypt.compare(password, hospital.password);
    if (!isMatch) {
      return res.error("Invalid credentials", 401);
    }

    const token = jwt.sign({ id: hospital._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1h" });
    return res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    return res.error(error.message, error.status || 500);
  }
};

const getHospitalProfile = async (req, res) => {
  try {
    const { hospitalId } = req.body;
    assertObjectId(hospitalId, "hospitalId");
    const hospital = await hospitalModel.findById(hospitalId).select("-password");
    if (!hospital) {
      return res.error("Hospital not found", 404);
    }

    return res.json({ success: true, hospital });
  } catch (error) {
    console.log(error);
    return res.error(error.message, error.status || 500);
  }
};

const updateHospitalProfile = async (req, res) => {
  try {
    const { hospitalId, name, city, description } = req.body;
    assertObjectId(hospitalId, "hospitalId");

    const updateData = {
      name,
      city,
      description,
    };

    if (req.file) {
      const existingHospital = await hospitalModel
        .findById(hospitalId)
        .select("logoPublicId");
      if (existingHospital?.logoPublicId) {
        await cloudinary.uploader.destroy(existingHospital.logoPublicId);
      }
      const uploaded = await uploadBufferToCloudinary(req.file.buffer, "medibridge/hospitals");
      updateData.logo = uploaded.secure_url;
      updateData.logoPublicId = uploaded.public_id;
    }

    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

    await hospitalModel.findByIdAndUpdate(hospitalId, updateData);
    return res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.log(error);
    return res.error(error.message, error.status || 500);
  }
};

const listHospitalDoctors = async (req, res) => {
  try {
    const { hospitalId } = req.body;
    assertObjectId(hospitalId, "hospitalId");
    const doctors = await doctorModel.find({ hospitalId }).select("-password");
    return res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    return res.error(error.message, error.status || 500);
  }
};

const linkDoctorToHospital = async (req, res) => {
  try {
    const { hospitalId, doctorId, doctorEmail } = req.body;
    assertObjectId(hospitalId, "hospitalId");
    if (!doctorId && !doctorEmail) {
      return res.error("Doctor ID or email required", 400);
    }
    const doctor = doctorId
      ? await doctorModel.findById(doctorId)
      : await doctorModel.findOne({ email: doctorEmail });
    if (!doctor) {
      return res.error("Doctor not found", 404);
    }

    await doctorModel.findByIdAndUpdate(doctor._id, { hospitalId });
    return res.json({ success: true, message: "Doctor linked" });
  } catch (error) {
    console.log(error);
    return res.error(error.message, error.status || 500);
  }
};

const unlinkDoctorFromHospital = async (req, res) => {
  try {
    const { hospitalId, doctorId } = req.body;
    assertObjectId(hospitalId, "hospitalId");
    assertObjectId(doctorId, "doctorId");

    const doctor = await doctorModel.findById(doctorId);
    if (!doctor) {
      return res.error("Doctor not found", 404);
    }

    if (doctor.hospitalId?.toString() !== hospitalId) {
      return res.error("Doctor not linked to this hospital", 400);
    }

    await doctorModel.findByIdAndUpdate(doctorId, { hospitalId: null });
    return res.json({ success: true, message: "Doctor unlinked" });
  } catch (error) {
    console.log(error);
    return res.error(error.message, error.status || 500);
  }
};

const getHospitalById = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    assertObjectId(hospitalId, "hospitalId");
    const hospital = await hospitalModel.findById(hospitalId).select("-password");
    if (!hospital) {
      return res.error("Hospital not found", 404);
    }
    return res.json({ success: true, hospital });
  } catch (error) {
    console.log(error);
    return res.error(error.message, error.status || 500);
  }
};

export {
  registerHospital,
  loginHospital,
  getHospitalProfile,
  updateHospitalProfile,
  listHospitalDoctors,
  linkDoctorToHospital,
  unlinkDoctorFromHospital,
  getHospitalById,
};
