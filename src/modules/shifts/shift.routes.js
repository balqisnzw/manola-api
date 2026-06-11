const express = require("express");
const router = express.Router();
const shiftController = require("./shift.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");

router.use(verifyToken);
router.use(checkRole("OWNER", "ADMIN", "KASIR"));

router.get("/active", shiftController.getActiveShift);
router.post("/start", shiftController.startShift);
router.post("/:id/close", shiftController.closeShift);
router.post("/petty-cash", shiftController.addPettyCash);
router.get("/", checkRole("OWNER", "ADMIN"), shiftController.getShifts);

module.exports = router;
