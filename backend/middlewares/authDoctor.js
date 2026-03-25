import jwt from "jsonwebtoken";

// doctor authentication middleware
const authDoctor = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const token = bearer || req.headers.dtoken; // fallback
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: "JWT secret not configured" });
    }
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);
    req.body.docId = token_decode.id;
    next();
  } catch (error) {
    console.log(error);
    const status = error.name === "JsonWebTokenError" || error.name === "TokenExpiredError" ? 401 : 500;
    res.status(status).json({ success: false, message: "Unauthorized" });
  }
};

export default authDoctor;
