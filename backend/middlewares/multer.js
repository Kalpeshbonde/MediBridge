import multer from "multer";
import crypto from "crypto";

const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/jpg"]; // basic image whitelist

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error("Only image uploads are allowed"));
    }
    // attach a safe filename
    file.safeFilename = `${crypto.randomBytes(12).toString("hex")}`;
    cb(null, true);
  },
});

export default upload;
