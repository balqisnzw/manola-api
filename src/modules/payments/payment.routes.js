const express = require("express");
const router = express.Router();
const paymentController = require("./payment.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");

// Webhook Midtrans (Public, tanpa autentikasi JWT)
router.post("/webhook", paymentController.midtransWebhook);

// Semua route payment di bawah ini memerlukan autentikasi
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

// Regenerate Midtrans Token (Bayar Ulang)
router.post("/:orderId/regenerate-token", paymentController.regenerateToken);

// Membatalkan pembayaran/order (hanya USER pemilik order)
router.post("/:orderId/cancel", paymentController.cancelPayment);

// Mengupdate status pembayaran (hanya OWNER, ADMIN, KASIR)
router.put(
  "/:id/status",
  checkRole("OWNER", "ADMIN", "KASIR"),
  paymentController.updatePaymentStatus
);

module.exports = router;
