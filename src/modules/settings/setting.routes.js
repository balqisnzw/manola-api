const express = require("express");
const router = express.Router();
const settingController = require("./setting.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");

// GET is public or verified token (cashier needs to read PPN key for checkout)
router.get("/", settingController.getSettings);

// PUT is restricted to ADMIN/OWNER only
router.put("/", verifyToken, checkRole("OWNER", "ADMIN"), settingController.updateSettings);

const upload = require("../../middlewares/upload.middleware");
router.post("/logo", verifyToken, checkRole("OWNER", "ADMIN"), upload.single("logo"), settingController.uploadLogo);

module.exports = router;
