import jwt from "jsonwebtoken";

const authHospital = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const token = bearer || req.headers.token; // fallback
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: "JWT secret not configured" });
    }
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.body.hospitalId = token_decode.id;
    next();
  } catch (error) {
    console.log(error);
    const status = error.name === "JsonWebTokenError" || error.name === "TokenExpiredError" ? 401 : 500;
    res.status(status).json({ success: false, message: "Unauthorized" });
  }
};

export default authHospital;
