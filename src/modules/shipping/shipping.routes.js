const express = require("express");
const router = express.Router();
const shippingController = require("./shipping.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");

// Require authentication for all shipping operations to protect API keys
router.use(verifyToken);

router.get("/provinces", shippingController.getProvinces);
router.get("/cities/:provinceId", shippingController.getCities);
router.get("/districts/:cityId", shippingController.getDistricts);
router.post("/calculate", shippingController.calculateCost);

module.exports = router;
