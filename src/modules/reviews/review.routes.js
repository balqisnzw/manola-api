const express = require("express");
const router = express.Router();
const reviewController = require("./review.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");

// Membuat ulasan (harus login), maksimal 3 gambar
router.post("/", verifyToken, upload.array("images", 3), reviewController.createReview);

// Melihat ulasan produk tertentu (public)
router.get("/products/:productId", reviewController.getProductReviews);

module.exports = router;
