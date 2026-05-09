const express = require("express");
const router = express.Router();
const supplierController = require("./supplier.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");

// Semua route supplier memerlukan token dan role OWNER/ADMIN
router.use(verifyToken);
router.use(checkRole("OWNER", "ADMIN"));

router.get("/", supplierController.getSuppliers);
router.get("/:id", supplierController.getSupplier);
router.post("/", supplierController.createSupplier);
router.put("/:id", supplierController.updateSupplier);
router.delete("/:id", supplierController.deleteSupplier);

module.exports = router;
