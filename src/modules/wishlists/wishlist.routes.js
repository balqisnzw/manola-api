const express = require("express");
const router = express.Router();
const wishlistController = require("./wishlist.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");

// Semua route wishlist memerlukan autentikasi
router.use(verifyToken);

// Tambah produk ke wishlist
router.post("/", wishlistController.addToWishlist);

// Lihat daftar wishlist
router.get("/", wishlistController.getWishlist);

// Hapus produk dari wishlist
router.delete("/:id", wishlistController.removeFromWishlist);

module.exports = router;
