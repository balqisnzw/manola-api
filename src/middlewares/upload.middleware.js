const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Parse CLOUDINARY_URL manually as fallback for Vercel
if (!cloudinary.config().cloud_name && process.env.CLOUDINARY_URL) {
  const url = new URL(process.env.CLOUDINARY_URL.replace("cloudinary://", "https://"));
  cloudinary.config({
    cloud_name: url.hostname,
    api_key: url.username,
    api_secret: url.password,
  });
}

// Konfigurasi penyimpanan multer dengan Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "manola_uploads",
    allowed_formats: ["jpeg", "jpg", "png", "webp"],
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Maksimal 2MB per file
  },
});

module.exports = upload;
