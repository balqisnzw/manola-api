const express = require("express");
const router = express.Router();
const productController = require("./product.controller");

router.get("/", productController.getProducts);
router.get("/:id", productController.getProduct);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);
//http://localhost:4000/api/products/1

module.exports = router;