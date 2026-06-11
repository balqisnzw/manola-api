const express = require("express");
const router = express.Router();
const bannerController = require("./banner.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");

// Public: get banners (untuk home page carousel)
router.get("/", bannerController.getBanners);

// Protected: CRUD
router.use(verifyToken);
router.post("/", checkRole("ADMIN", "OWNER"), upload.single("gambar"), bannerController.createBanner);
router.put("/:id", checkRole("ADMIN", "OWNER"), upload.single("gambar"), bannerController.updateBanner);
router.delete("/:id", checkRole("ADMIN", "OWNER"), bannerController.deleteBanner);

module.exports = router;
