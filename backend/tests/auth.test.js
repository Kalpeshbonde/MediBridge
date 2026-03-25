import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import jwt from "jsonwebtoken";
import authUser from "../middlewares/authUser.js";
import authDoctor from "../middlewares/authDoctor.js";
import requireRole from "../middlewares/requireRole.js";
import userModel from "../models/userModel.js";

vi.mock("../models/userModel.js", () => ({
  __esModule: true,
  default: {
    findById: vi.fn(),
  },
}));

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

const mockNext = () => vi.fn();

beforeEach(() => {
  process.env.JWT_SECRET = "testsecret123";
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("authUser middleware", () => {
  it("returns 401 when token is missing", async () => {
    const req = { headers: {}, body: {} };
    const res = mockRes();
    const next = mockNext();

    await authUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.payload?.success).toBe(false);
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches userId when token is valid", async () => {
    const token = jwt.sign({ id: "user123" }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` }, body: {} };
    const res = mockRes();
    const next = mockNext();

    await authUser(req, res, next);

    expect(req.body.userId).toBe("user123");
    expect(next).toHaveBeenCalled();
  });
});

describe("authDoctor middleware", () => {
  it("returns 401 when token is invalid", async () => {
    const req = { headers: { authorization: "Bearer invalid" }, body: {} };
    const res = mockRes();
    const next = mockNext();

    await authDoctor(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.payload?.success).toBe(false);
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches docId when token is valid", async () => {
    const token = jwt.sign({ id: "doc123" }, process.env.JWT_SECRET);
    const req = { headers: { authorization: `Bearer ${token}` }, body: {} };
    const res = mockRes();
    const next = mockNext();

    await authDoctor(req, res, next);

    expect(req.body.docId).toBe("doc123");
    expect(next).toHaveBeenCalled();
  });
});

describe("requireRole middleware", () => {
  it("returns 401 when userId is missing", async () => {
    const req = { body: {} };
    const res = mockRes();
    const next = mockNext();

    await requireRole(["admin"])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 when role is not allowed", async () => {
    userModel.findById.mockResolvedValue({ role: "user" });
    const req = { body: { userId: "u1" } };
    const res = mockRes();
    const next = mockNext();

    await requireRole(["admin"])(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next when role is allowed", async () => {
    userModel.findById.mockResolvedValue({ role: "admin" });
    const req = { body: { userId: "u1" } };
    const res = mockRes();
    const next = mockNext();

    await requireRole(["admin"])(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalledWith(403);
  });
});
