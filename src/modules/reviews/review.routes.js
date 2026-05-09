const express = require("express");
const router = express.Router();
const reviewController = require("./review.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");

// Membuat ulasan (harus login)
router.post("/", verifyToken, reviewController.createReview);

// Melihat ulasan produk tertentu (public)
router.get("/products/:productId", reviewController.getProductReviews);

module.exports = router;
