const express = require("express");
const router = express.Router();
const analyticsController = require("./analytics.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");

router.get("/dashboard", verifyToken, checkRole("OWNER", "ADMIN"), analyticsController.getDashboardData);

module.exports = router;
