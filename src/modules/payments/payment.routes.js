const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");

// Semua route payment memerlukan autentikasi
router.use(verifyToken);

// Membuat pembayaran untuk suatu order
router.post("/", paymentController.createPayment);

// Mendapatkan daftar pembayaran (hanya OWNER, ADMIN, KASIR)
router.get(
  "/",
  checkRole("OWNER", "ADMIN", "KASIR"),
  paymentController.getPayments
);

// Mendapatkan detail pembayaran
router.get("/:id", paymentController.getPayment);

// Mengupdate status pembayaran (hanya OWNER, ADMIN, KASIR)
router.put(
  "/:id/status",
  checkRole("OWNER", "ADMIN", "KASIR"),
  paymentController.updatePaymentStatus
);

module.exports = router;
