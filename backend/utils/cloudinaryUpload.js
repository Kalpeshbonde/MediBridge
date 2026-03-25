import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";

export const uploadBufferToCloudinary = (buffer, folder = "medibridge/uploads") => {
  return new Promise((resolve, reject) => {
    const publicId = `${folder}/${crypto.randomBytes(12).toString("hex")}`;
    const stream = cloudinary.uploader.upload_stream(
      { public_id: publicId, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};
