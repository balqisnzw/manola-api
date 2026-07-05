const express = require("express");
const router = express.Router();
const bannerController = require("./banner.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");

// Public: get banners (untuk home page carousel)
router.get("/", bannerController.getBanners);

// Protected: CRUD
router.use(verifyToken);
router.post("/", checkRole("ADMIN", "OWNER"), (req, res, next) => {
  upload.single("gambar")(req, res, (err) => {
    if (err) {
      console.error("Multer/Cloudinary Error (createBanner):", err.message, err.stack);
      return res.status(400).json({ status: "Failed", message: err.message || "Gagal mengunggah foto" });
    }
    next();
  });
}, bannerController.createBanner);
router.put("/:id", checkRole("ADMIN", "OWNER"), (req, res, next) => {
  upload.single("gambar")(req, res, (err) => {
    if (err) {
      console.error("Multer/Cloudinary Error (updateBanner):", err.message, err.stack);
      return res.status(400).json({ status: "Failed", message: err.message || "Gagal mengunggah foto" });
    }
    next();
  });
}, bannerController.updateBanner);
router.delete("/:id", checkRole("ADMIN", "OWNER"), bannerController.deleteBanner);

module.exports = router;
