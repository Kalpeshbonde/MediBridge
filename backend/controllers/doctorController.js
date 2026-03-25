import doctorModel from "../models/doctorModel.js";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import { v2 as cloudinary } from "cloudinary";
import hospitalModel from "../models/hospitalModel.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
import { assertEmail, assertObjectId, assertRequired } from "../utils/validators.js";

const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;
    assertObjectId(docId, "docId");
    const docData = await doctorModel.findById(docId);
    if (!docData) {
      return res.error("Doctor not found", 404);
    }
    await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });
    res.json({ success: true, message: "Availability changed" });
  } catch (error) {
    console.log(error);
    res.error(error.message, error.status || 500);
  }
};

const doctorList = async (req, res) => {
  try {
    const {
      city,
      speciality,
      minFees,
      maxFees,
      available,
      page = 1,
      limit = 20,
      sort = "rating",
    } = req.query;

    const filter = {};
    if (city) filter.city = city;
    if (speciality) filter.speciality = speciality;
    if (available !== undefined) filter.available = available === "true";
    if (minFees || maxFees) {
      filter.fees = {};
      if (minFees) filter.fees.$gte = Number(minFees);
      if (maxFees) filter.fees.$lte = Number(maxFees);
    }

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(Number(limit) || 20, 50));

    const sortMap = {
      rating: { ratingAvg: -1, ratingCount: -1 },
      feesAsc: { fees: 1 },
      feesDesc: { fees: -1 },
      newest: { date: -1 },
    };
    const sortBy = sortMap[sort] || sortMap.rating;

    const total = await doctorModel.countDocuments(filter);

    const doctors = await doctorModel
      .find(filter)
      .select(["-password", "-email"])
      .sort(sortBy)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const hospitalIds = [
      ...new Set(doctors.map((doc) => doc.hospitalId).filter(Boolean)),
    ];
    const hospitals = hospitalIds.length
      ? await hospitalModel.find({ _id: { $in: hospitalIds } }).select("-password")
      : [];
    const hospitalMap = hospitals.reduce((acc, hospital) => {
      acc[hospital._id.toString()] = hospital;
      return acc;
    }, {});

    const doctorsWithHospital = doctors.map((doc) => ({
      ...doc.toObject(),
      hospital: doc.hospitalId ? hospitalMap[doc.hospitalId] || null : null,
    }));

    res.json({
      success: true,
      doctors: doctorsWithHospital,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.log(error);
    res.error(error.message, error.status || 500);
  }
};

const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    assertRequired({ email, password });
    assertEmail(email);
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) return res.error("Invalid credentials", 401);
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (isMatch) {
      const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1h" });
      res.json({ success: true, token });
    } else {
      res.error("Invalid credentials", 401);
    }
  } catch (error) {
    console.log(error);
    res.error(error.message, error.status || 500);
  }
};

const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body;
    assertObjectId(docId, "docId");
    const appointments = await appointmentModel.find({ docId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.error(error.message, error.status || 500);
  }
};

const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    assertObjectId(docId, "docId");
    assertObjectId(appointmentId, "appointmentId");
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.error("Appointment not found", 404);
    }
    if (appointmentData.docId.toString() !== docId.toString()) {
      return res.error("Unauthorized", 403);
    }
    await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
    return res.json({ success: true, message: "Appointment Completed" });
  } catch (error) {
    console.log(error);
    res.error(error.message, error.status || 500);
  }
};

const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    assertObjectId(docId, "docId");
    assertObjectId(appointmentId, "appointmentId");
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.error("Appointment not found", 404);
    }
    if (appointmentData.docId.toString() !== docId.toString()) {
      return res.error("Unauthorized", 403);
    }
    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
    return res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.error(error.message, error.status || 500);
  }
};

const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;
    assertObjectId(docId, "docId");
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
    res.error(error.message, error.status || 500);
  }
};

const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    assertObjectId(docId, "docId");
    const profileData = await doctorModel.findById(docId).select("-password");
    if (!profileData) {
      return res.error("Doctor not found", 404);
    }
    res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.error(error.message, error.status || 500);
  }
};

const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available, about, experience, city, hospitalId } = req.body;
    assertObjectId(docId, "docId");
    const imageFile = req.file;
    if (hospitalId) {
      assertObjectId(hospitalId, "hospitalId");
      const hospital = await hospitalModel.findById(hospitalId);
      if (!hospital) {
        return res.error("Hospital not found.", 404);
      }
    }
    const existingDoctor = await doctorModel.findById(docId).select("imagePublicId");
    if (!existingDoctor) {
      return res.error("Doctor not found", 404);
    }
    const updateData = {
      fees: Number(fees),
      available,
      about,
      experience,
      city,
      hospitalId: hospitalId || null,
      address: address ? JSON.parse(address) : undefined,
    };
    if (imageFile) {
      if (existingDoctor.imagePublicId) {
        await cloudinary.uploader.destroy(existingDoctor.imagePublicId);
      }
      const uploaded = await uploadBufferToCloudinary(imageFile.buffer, "medibridge/doctors");
      updateData.image = uploaded.secure_url;
      updateData.imagePublicId = uploaded.public_id;
    }
    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);
    await doctorModel.findByIdAndUpdate(docId, updateData);
    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.error(error.message, error.status || 500);
  }
};

const registerDoctor = async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
      available,
      city,
      hospitalId,
    } = req.body;
    const imageFile = req.file;
    assertRequired({ userId, name, email, speciality, degree, experience, fees, city });
    assertEmail(email);
    if (hospitalId) {
      assertObjectId(hospitalId, "hospitalId");
      const hospital = await hospitalModel.findById(hospitalId);
      if (!hospital) {
        return res.error("Hospital not found.", 404);
      }
    }
    assertObjectId(userId, "userId");
    const existing = await doctorModel.findOne({ email });
    if (existing) {
      return res.error("Doctor profile already exists.", 409);
    }
    const userRecord = await userModel.findById(userId);
    if (!userRecord) {
      return res.error("User not found.", 404);
    }
    if (userRecord.doctorId) {
      return res.error("Doctor profile already linked.", 400);
    }
    let imageUrl = "";
    let imagePublicId = "";
    if (imageFile) {
      const uploaded = await uploadBufferToCloudinary(imageFile.buffer, "medibridge/doctors");
      imageUrl = uploaded.secure_url;
      imagePublicId = uploaded.public_id;
    }
    const doctorData = {
      name,
      email,
      password: userRecord.password,
      image: imageUrl,
      imagePublicId,
      speciality,
      degree,
      experience,
      about: about || "",
      available: available !== undefined ? available : true,
      fees: Number(fees),
      address: address ? JSON.parse(address) : { line1: "", line2: "" },
      city,
      hospitalId: hospitalId || null,
      date: Date.now(),
      slots_booked: {},
    };
    const newDoctor = new doctorModel(doctorData);
    const savedDoctor = await newDoctor.save();
    await userModel.findByIdAndUpdate(userId, {
      doctorId: savedDoctor._id.toString(),
      role: "doctor",
    });
    res.json({ success: true, message: "Doctor profile created.", doctorId: savedDoctor._id });
  } catch (error) {
    console.log(error);
    res.error(error.message, error.status || 500);
  }
};

// ── User-token-based versions (for doctor dashboard using user JWT) ────────────

const doctorProfileByUser = async (req, res) => {
  try {
    const { userId } = req.body;
    assertObjectId(userId, "userId");
    const userRecord = await userModel.findById(userId);
    if (!userRecord || userRecord.role !== "doctor" || !userRecord.doctorId) {
      return res.error("Doctor profile not found.", 404);
    }
    const profileData = await doctorModel.findById(userRecord.doctorId).select("-password");
    if (!profileData) {
      return res.error("Doctor profile not found.", 404);
    }
    res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.error(error.message, error.status || 500);
  }
};

const appointmentsByUser = async (req, res) => {
  try {
    const { userId } = req.body;
    assertObjectId(userId, "userId");
    const userRecord = await userModel.findById(userId);
    if (!userRecord || userRecord.role !== "doctor" || !userRecord.doctorId) {
      return res.json({ success: true, appointments: [] });
    }
    const appointments = await appointmentModel.find({ docId: userRecord.doctorId });
    res.json({ success: true, appointments });
  } catch (error) {
    console.log(error);
    res.error(error.message, error.status || 500);
  }
};

const updateDoctorProfileByUser = async (req, res) => {
  try {
    const { userId, fees, address, available, about, experience, city, hospitalId } = req.body;
    assertObjectId(userId, "userId");
    const imageFile = req.file;
    const userRecord = await userModel.findById(userId);
    if (!userRecord || userRecord.role !== "doctor" || !userRecord.doctorId) {
      return res.error("Doctor profile not found.", 404);
    }
    if (hospitalId) {
      assertObjectId(hospitalId, "hospitalId");
      const hospital = await hospitalModel.findById(hospitalId);
      if (!hospital) {
        return res.error("Hospital not found.", 404);
      }
    }
    const updateData = {
      fees: Number(fees),
      available,
      about,
      experience,
      city,
      hospitalId: hospitalId || null,
      address: address ? JSON.parse(address) : undefined,
    };
    if (imageFile) {
      const existingDoctor = await doctorModel
        .findById(userRecord.doctorId)
        .select("imagePublicId");
      if (existingDoctor?.imagePublicId) {
        await cloudinary.uploader.destroy(existingDoctor.imagePublicId);
      }
      const uploaded = await uploadBufferToCloudinary(imageFile.buffer, "medibridge/doctors");
      updateData.image = uploaded.secure_url;
      updateData.imagePublicId = uploaded.public_id;
    }
    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);
    await doctorModel.findByIdAndUpdate(userRecord.doctorId, updateData);
    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.error(error.message, error.status || 500);
  }
};

const uploadDoctorImage = async (req, res) => {
  try {
    const imageFile = req.file;
    if (!imageFile) return res.error("No image provided.", 400);
    const uploaded = await uploadBufferToCloudinary(imageFile.buffer, "medibridge/doctors");
    res.json({ success: true, imageUrl: uploaded.secure_url });
  } catch (error) {
    console.log(error);
    res.error(error.message, error.status || 500);
  }
};
const getDoctorById = async (req, res) => {
  try {
    const { docId } = req.params;
    assertObjectId(docId, "docId");
    const doctor = await doctorModel.findById(docId).select("-password");
    if (!doctor) {
      return res.error("Doctor not found.", 404);
    }
    let hospital = null;
    if (doctor.hospitalId) {
      hospital = await hospitalModel
        .findById(doctor.hospitalId)
        .select("-password");
    }
    res.json({ success: true, doctor: { ...doctor.toObject(), hospital } });
  } catch (error) {
    console.log(error);
    res.error(error.message, error.status || 500);
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
  getDoctorById,
};