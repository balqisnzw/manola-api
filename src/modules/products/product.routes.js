const express = require("express");
const router = express.Router();
const productController = require("./product.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");

// Public routes (tidak perlu token)
router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);

// Protected routes (hanya OWNER dan ADMIN)
router.post(
  "/",
  verifyToken,
  checkRole("OWNER", "ADMIN"),
  upload.array("photos", 5), // maksimal 5 foto
  productController.createProduct
);

router.put(
  "/:id",
  verifyToken,
  checkRole("OWNER", "ADMIN"),
  upload.array("photos", 5),
  productController.updateProduct
);

// Hanya OWNER dan ADMIN yang bisa menghapus produk
router.delete(
  "/:id",
  verifyToken,
  checkRole("OWNER", "ADMIN"),
  productController.deleteProduct
);

// === Variant Management (OWNER dan ADMIN) ===
router.post(
  "/:id/variants",
  verifyToken,
  checkRole("OWNER", "ADMIN"),
  productController.addVariant
);

router.put(
  "/variants/:variantId",
  verifyToken,
  checkRole("OWNER", "ADMIN"),
  productController.editVariant
);

router.delete(
  "/variants/:variantId",
  verifyToken,
  checkRole("OWNER", "ADMIN"),
  productController.removeVariant
);

module.exports = router;