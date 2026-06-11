const express = require("express");
const router = express.Router();
const categoryController = require("./category.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");

// Public: get all categories (untuk dropdown di form produk, dll.)
router.get("/", categoryController.getCategories);

// Protected: CRUD
router.use(verifyToken);
router.post("/", checkRole("ADMIN", "OWNER"), categoryController.createCategory);
router.put("/:id", checkRole("ADMIN", "OWNER"), categoryController.updateCategory);
router.delete("/:id", checkRole("ADMIN", "OWNER"), categoryController.deleteCategory);

module.exports = router;
