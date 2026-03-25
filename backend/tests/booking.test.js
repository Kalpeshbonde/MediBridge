import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { bookAppointment, cancelAppointment } from "../controllers/userController.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";

vi.mock("../models/doctorModel.js", () => ({
  __esModule: true,
  default: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock("../models/userModel.js", () => ({
  __esModule: true,
  default: {
    findById: vi.fn(),
  },
}));

vi.mock("../models/appointmentModel.js", () => {
  const findById = vi.fn();
  const findOne = vi.fn();
  const find = vi.fn();
  const save = vi.fn();

  function Appointment(data) {
    Object.assign(this, data);
    this.save = save;
  }

  Appointment.findById = findById;
  Appointment.findOne = findOne;
  Appointment.find = find;

  return {
    __esModule: true,
    default: Appointment,
  };
});

const mockRes = () => {
  const res = {};
  res.statusCode = 200;
  res.status = vi.fn().mockImplementation((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn().mockImplementation((payload) => {
    res.payload = payload;
    return res;
  });
  return res;
};

const makeReq = (body) => ({ body });

beforeEach(() => {
  process.env.JWT_SECRET = "testsecret123";
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const userId = "507f1f77bcf86cd799439011";
const docId = "507f1f77bcf86cd799439012";

describe("bookAppointment", () => {
  it("returns 404 when doctor is missing", async () => {
    doctorModel.findById.mockImplementationOnce(() => ({
      select: vi.fn().mockResolvedValue(null),
    }));
    const req = makeReq({ userId, docId, slotDate: "2024-01-01", slotTime: "10:00" });
    const res = mockRes();

    await bookAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.payload?.message).toMatch(/Doctor not found/);
  });

  it("returns 409 when slot already booked", async () => {
    doctorModel.findById.mockImplementationOnce(() => ({
      select: vi.fn().mockResolvedValue({
        available: true,
        slots_booked: { "2024-01-01": ["10:00"] },
        fees: 100,
        city: "",
        toObject: () => ({ available: true, slots_booked: { "2024-01-01": ["10:00"] }, fees: 100, city: "" }),
      }),
    }));
    appointmentModel.findOne.mockResolvedValue({ id: "existing" });
    userModel.findById.mockImplementation(() => ({
      select: vi.fn().mockResolvedValue({ toObject: () => ({ city: "" }) }),
    }));
    const req = makeReq({ userId, docId, slotDate: "2024-01-01", slotTime: "10:00" });
    const res = mockRes();

    await bookAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.payload?.success).toBe(false);
  });
});

describe("cancelAppointment", () => {
  it("returns 404 when appointment is missing", async () => {
    appointmentModel.findById.mockResolvedValue(null);
    const req = makeReq({ userId, appointmentId: "507f1f77bcf86cd799439013" });
    const res = mockRes();

    await cancelAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("returns 403 when user does not own appointment", async () => {
    appointmentModel.findById.mockResolvedValue({ userId: "someoneElse", docId: "d1", cancelled: false, slotDate: "2024-01-01", slotTime: "09:00" });
    const req = makeReq({ userId, appointmentId: "507f1f77bcf86cd799439013" });
    const res = mockRes();

    await cancelAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.payload?.message).toMatch(/Unauthorized/);
  });
});
