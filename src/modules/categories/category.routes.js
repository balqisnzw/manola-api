const express = require("express");
const router = express.Router();
const categoryController = require("./category.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");

// Public route (tidak perlu token)
router.get("/", categoryController.getCategories);

// Protected routes (hanya OWNER dan ADMIN)
router.post(
  "/",
  verifyToken,
  checkRole("OWNER", "ADMIN"),
  categoryController.createCategory
);

router.put(
  "/:id",
  verifyToken,
  checkRole("OWNER", "ADMIN"),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  verifyToken,
  checkRole("OWNER", "ADMIN"),
  categoryController.deleteCategory
);

module.exports = router;
