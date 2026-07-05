const express = require("express");
const router = express.Router();
const settingController = require("./setting.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");

// GET is public or verified token (cashier needs to read PPN key for checkout)
router.get("/", settingController.getSettings);

// PUT is restricted to ADMIN/OWNER only
router.put("/", verifyToken, checkRole("OWNER", "ADMIN"), settingController.updateSettings);

const upload = require("../../middlewares/upload.middleware");
router.post("/logo", verifyToken, checkRole("OWNER", "ADMIN"), (req, res, next) => {
  upload.single("logo")(req, res, (err) => {
    if (err) {
      console.error("Multer/Cloudinary Error (uploadLogo):", err.message, err.stack);
      return res.status(400).json({ status: "Failed", message: err.message || "Gagal mengunggah foto" });
    }
    next();
  });
}, settingController.uploadLogo);

module.exports = router;
