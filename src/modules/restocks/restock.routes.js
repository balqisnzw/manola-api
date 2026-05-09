const express = require("express");
const router = express.Router();
const restockController = require("./restock.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");

// Semua route restock memerlukan autentikasi dan hanya OWNER/ADMIN
router.use(verifyToken);
router.use(checkRole("OWNER", "ADMIN"));

// Membuat restock (otomatis tambah stok variant)
router.post("/", restockController.createRestock);

// Melihat histori restock
router.get("/", restockController.getRestocks);

module.exports = router;
