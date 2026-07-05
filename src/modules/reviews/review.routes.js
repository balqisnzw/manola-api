const express = require("express");
const router = express.Router();
const reviewController = require("./review.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");

// Membuat ulasan (harus login), maksimal 3 gambar
router.post("/", verifyToken, (req, res, next) => {
  const uploadMiddleware = upload.array("images", 3);
  uploadMiddleware(req, res, (err) => {
    if (err) {
      console.error("Multer/Cloudinary Error (createReview):", err.message, err.stack);
      return res.status(400).json({ status: "Failed", message: err.message || "Gagal mengunggah foto" });
    }
    next();
  });
}, reviewController.createReview);

// Melihat ulasan produk tertentu (public)
router.get("/products/:productId", reviewController.getProductReviews);

module.exports = router;
