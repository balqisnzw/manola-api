const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Get all users (OWNER only, for pelanggan page)
router.get("/users", verifyToken, checkRole("OWNER"), authController.getUsers);

module.exports = router;

