const express = require("express");
const router = express.Router();
const returnController = require("./return.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");

// Upload foto bukti retur (max 3 foto)
router.post("/upload-image", verifyToken, upload.array("files", 3), returnController.uploadImages);

// Pelanggan membuat pengajuan retur
router.post("/", verifyToken, returnController.createReturnRequest);

// Admin/Owner melihat semua pengajuan
router.get("/", verifyToken, checkRole("ADMIN", "OWNER"), returnController.getAllReturnRequests);

// Admin/Owner menyetujui/menolak pengajuan
router.put("/:id/status", verifyToken, checkRole("ADMIN", "OWNER"), returnController.updateReturnRequestStatus);

// Pelanggan memasukkan nomor resi pengiriman retur
router.put("/:id/resi", verifyToken, returnController.submitResi);

// Admin/Owner mengkonfirmasi paket retur sudah sampai
router.put("/:id/receive", verifyToken, checkRole("ADMIN", "OWNER"), returnController.receivePackage);

module.exports = router;
