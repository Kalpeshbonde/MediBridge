import axios from "axios";

export const uploadImageToCloudinary = async (file, backendUrl, token, onProgress) => {
  const formData = new FormData();
  formData.append("image", file);

  const { data } = await axios.post(backendUrl + "/api/doctor/upload-image", formData, {
    headers: { token, "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  });

  if (!data.success) throw new Error(data.message);
  return data.imageUrl;
};