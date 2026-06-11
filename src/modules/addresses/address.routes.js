const express = require("express");
const router = express.Router();
const addressController = require("./address.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");

// Semua route memerlukan login
router.use(verifyToken);

// CRUD alamat
router.get("/", addressController.getMyAddresses);
router.get("/:id", addressController.getAddressById);
router.post("/", addressController.createAddress);
router.put("/:id", addressController.updateAddress);
router.put("/:id/utama", addressController.setUtama);
router.delete("/:id", addressController.deleteAddress);

module.exports = router;
