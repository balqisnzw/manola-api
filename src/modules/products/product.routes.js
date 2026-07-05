const express = require("express");
const router = express.Router();
const productController = require("./product.controller");
const { verifyToken, checkRole } = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");

// Public routes (tidak perlu token)
router.get("/", productController.getProducts);

// SKU Suggestion (hanya OWNER dan ADMIN)
router.get(
  "/sku-suggestion",
  verifyToken,
  checkRole("OWNER", "ADMIN"),
  productController.getSkuSuggestion
);

router.get("/:id", productController.getProduct);

// Protected routes (hanya OWNER dan ADMIN)
router.post(
  "/",
  verifyToken,
  checkRole("OWNER", "ADMIN"),
  (req, res, next) => {
    upload.fields([{ name: "photos", maxCount: 5 }, { name: "descriptionImage", maxCount: 1 }])(req, res, (err) => {
      if (err) {
        console.error("Multer/Cloudinary Error (createProduct):", err.message, err.stack);
        return res.status(400).json({ status: "Failed", message: err.message || "Gagal mengunggah foto" });
      }
      next();
    });
  },
  productController.createProduct
);

router.put(
  "/:id",
  verifyToken,
  checkRole("OWNER", "ADMIN"),
  (req, res, next) => {
    upload.fields([{ name: "photos", maxCount: 5 }, { name: "descriptionImage", maxCount: 1 }])(req, res, (err) => {
      if (err) {
        console.error("Multer/Cloudinary Error (updateProduct):", err.message, err.stack);
        return res.status(400).json({ status: "Failed", message: err.message || "Gagal mengunggah foto" });
      }
      next();
    });
  },
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