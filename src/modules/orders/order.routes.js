const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");

// Semua route order memerlukan autentikasi
router.use(verifyToken);

// Membuat pesanan baru (semua user yang sudah login bisa order)
router.post("/", orderController.createOrder);

// Mendapatkan semua pesanan (USER hanya lihat miliknya, admin/kasir lihat semua)
router.get("/", orderController.getOrders);

// Mendapatkan detail pesanan
router.get("/:id", orderController.getOrder);

// Mengubah status pesanan (hanya OWNER, ADMIN, KASIR, PACKAGING)
router.put(
  "/:id/status",
  checkRole("OWNER", "ADMIN", "KASIR", "PACKAGING"),
  orderController.updateOrderStatus
);

module.exports = router;
