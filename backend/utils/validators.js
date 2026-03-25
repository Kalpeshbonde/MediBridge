import mongoose from "mongoose";
import validator from "validator";

export const isObjectId = (value) => mongoose.Types.ObjectId.isValid(value || "");

export const assertObjectId = (value, fieldName = "id") => {
  if (!isObjectId(value)) {
    const err = new Error(`${fieldName} is invalid`);
    err.status = 400;
    throw err;
  }
};

export const assertEmail = (email) => {
  if (!email || !validator.isEmail(email)) {
    const err = new Error("Invalid email address");
    err.status = 400;
    throw err;
  }
};

export const assertRequired = (fields) => {
  const missing = Object.entries(fields)
    .filter(([, v]) => v === undefined || v === null || v === "")
    .map(([k]) => k);
  if (missing.length) {
    const err = new Error(`Missing required fields: ${missing.join(", ")}`);
    err.status = 400;
    throw err;
  }
};

export const assertNumber = (value, fieldName = "number", { min, max } = {}) => {
  const num = Number(value);
  if (Number.isNaN(num)) {
    const err = new Error(`${fieldName} must be a number`);
    err.status = 400;
    throw err;
  }
  if (min !== undefined && num < min) {
    const err = new Error(`${fieldName} must be >= ${min}`);
    err.status = 400;
    throw err;
  }
  if (max !== undefined && num > max) {
    const err = new Error(`${fieldName} must be <= ${max}`);
    err.status = 400;
    throw err;
  }
  return num;
};

export const assertEnum = (value, allowed, fieldName = "value") => {
  if (!allowed.includes(value)) {
    const err = new Error(`${fieldName} must be one of: ${allowed.join(", ")}`);
    err.status = 400;
    throw err;
  }
};
