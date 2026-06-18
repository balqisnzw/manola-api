const express = require("express");
const router = express.Router();
const cartController = require("./cart.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");

// Semua route cart memerlukan autentikasi
router.use(verifyToken);

// Dapatkan keranjang user
router.get("/", cartController.getCart);

// Tambah item ke keranjang
router.post("/items", cartController.addToCart);

// Update quantity item di keranjang (parameter id adalah variantId)
router.put("/items/:id", cartController.updateCartItem);

// Hapus item dari keranjang
router.delete("/items/:id", cartController.removeFromCart);

// Kosongkan keranjang
router.delete("/", cartController.clearCart);

module.exports = router;
