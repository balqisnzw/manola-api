const express = require("express");
const router = express.Router();
const voucherController = require("./voucher.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");

// Validasi voucher (customer, perlu login)
router.post("/validate", verifyToken, voucherController.validateVoucher);

// CRUD voucher (hanya ADMIN & OWNER)
router.use(verifyToken);
router.get("/", checkRole("ADMIN", "OWNER"), voucherController.getVouchers);
router.get("/:id", checkRole("ADMIN", "OWNER"), voucherController.getVoucher);
router.post("/", checkRole("ADMIN", "OWNER"), voucherController.createVoucher);
router.put("/:id", checkRole("ADMIN", "OWNER"), voucherController.updateVoucher);
router.delete("/:id", checkRole("ADMIN", "OWNER"), voucherController.deleteVoucher);

module.exports = router;
