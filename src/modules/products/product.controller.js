const productService = require("./product.service");
const fs = require("fs");
const path = require("path");

exports.getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, size, color } = req.query;

    const products = await productService.getAllProducts({
      category,
      minPrice,
      maxPrice,
      size,
      color,
    });

    res.status(200).json({
      status: "OK",
      message: "Success Get Data Products",
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Get Data Products",
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({
        status: "Failed",
        message: "Product Not Found",
      });
    }

    res.status(200).json({
      status: "OK",
      message: "Success Get Data Product",
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Get Data Product",
    });
  }
};

exports.getSkuSuggestion = async (req, res) => {
  try {
    const suggestion = await productService.getSkuSuggestion();
    res.status(200).json({
      status: "OK",
      message: "Success Get SKU Suggestion",
      data: { sku: suggestion },
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Get SKU Suggestion",
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, promoPrice, categoryId, supplierId, variants, sku, colorTags } =
      req.body;

    if (!name || !description || !price) {
      return res.status(400).json({
        status: "Failed",
        message: "Name, Description, And Price Are Required",
      });
    }

    let variantsData = [];

    if (variants) {
      const parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;

      variantsData = parsedVariants.map((v) => ({
        size: v.size,
        color: v.color || null,
        stock: parseInt(v.stock),
      }));
    }

    const imagesData = req.files && req.files['photos']
      ? req.files['photos'].map((f) => ({
          url: `/uploads/${f.filename}`,
        }))
      : [];

    const descriptionImageUrl = req.files && req.files['descriptionImage'] && req.files['descriptionImage'][0]
      ? `/uploads/${req.files['descriptionImage'][0].filename}`
      : null;

    const data = {
      name,
      description,
      price: parseInt(price),
      promoPrice: (promoPrice !== undefined && promoPrice !== null && promoPrice !== "" && promoPrice !== "null") ? parseInt(promoPrice) : null,
      categoryId: categoryId ? parseInt(categoryId) : null,
      supplierId: supplierId ? parseInt(supplierId) : null,
      sku: sku && sku.trim() !== "" ? sku.trim() : null,
      colorTags: colorTags && colorTags.trim() !== "" ? colorTags.trim() : null,
      descriptionImageUrl: descriptionImageUrl,
      images: {
        create: imagesData,
      },
      variants: {
        create: variantsData,
      },
    };

    const newProduct = await productService.createProduct(data);

    res.status(201).json({
      status: "OK",
      message: "Success Create Product",
      data: newProduct,
    });
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("sku")) {
      return res.status(400).json({
        status: "Failed",
        message: "Kode produk (SKU) sudah digunakan oleh produk lain",
      });
    }
    res.status(500).json({
      status: "Failed",
      message: "Failed To Create Product",
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await productService.getProductById(id);

    if (!existing) {
      return res.status(404).json({
        status: "Failed",
        message: "Product Not Found",
      });
    }

    const { name, description, price, promoPrice, categoryId, supplierId, variants, sku, colorTags } =
      req.body;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseInt(price);
    if (promoPrice !== undefined) {
      updateData.promoPrice = (promoPrice !== null && promoPrice !== "" && promoPrice !== "null") ? parseInt(promoPrice) : null;
    }
    if (categoryId !== undefined) updateData.categoryId = categoryId ? parseInt(categoryId) : null;

    if (sku !== undefined) {
      updateData.sku = sku && sku.trim() !== "" ? sku.trim() : null;
    }
    if (colorTags !== undefined) {
      updateData.colorTags = colorTags && colorTags.trim() !== "" ? colorTags.trim() : null;
    }

    if (supplierId !== undefined) {
      updateData.supplierId = supplierId ? parseInt(supplierId) : null;
    }

    // Handle photos update
    let newPhotos = [];
    if (req.files && req.files['photos'] && req.files['photos'].length > 0) {
      newPhotos = req.files['photos'].map((f) => ({ url: `/uploads/${f.filename}` }));
    }

    if (newPhotos.length > 0) {
      // Jika ada upload foto baru, kita timpa SEMUA foto lama karena begini cara kerjanya sekarang
      if (existing.images) {
        existing.images.forEach((img) => {
          const filePath = path.join(__dirname, "../../public", img.url);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }

      updateData.images = {
        deleteMany: {},
        create: newPhotos,
      };
    } else if (req.body.removeImageIds) {
      // Jika TIDAK ADA foto baru, tapi admin ingin menghapus beberapa foto spesifik
      try {
        const removeImageIds = JSON.parse(req.body.removeImageIds).map(id => parseInt(id));
        if (removeImageIds.length > 0) {
          updateData.images = {
            deleteMany: { id: { in: removeImageIds } }
          };
          if (existing.images) {
            existing.images.forEach((img) => {
              if (removeImageIds.includes(img.id)) {
                const filePath = path.join(__dirname, "../../public", img.url);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
              }
            });
          }
        }
      } catch (e) {}
    }

    // Handle description image update
    if (req.files && req.files['descriptionImage'] && req.files['descriptionImage'].length > 0) {
      if (existing.descriptionImageUrl) {
        const filePath = path.join(__dirname, "../../public", existing.descriptionImageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      updateData.descriptionImageUrl = `/uploads/${req.files['descriptionImage'][0].filename}`;
    } else if (req.body.removeDescriptionImage === "true") {
      // Admin ingin menghapus foto deskripsi yang sudah ada
      if (existing.descriptionImageUrl) {
        const filePath = path.join(__dirname, "../../public", existing.descriptionImageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      updateData.descriptionImageUrl = null;
    }

    // Handle variants update
    if (variants) {
      const parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;

      const existingVariants = existing.variants || [];
      const variantsToKeepIds = [];
      const updateOperations = [];
      const createOperations = [];

      for (const v of parsedVariants) {
        const match = existingVariants.find(ev => ev.size === v.size && (ev.color || null) === (v.color || null));
        if (match) {
          variantsToKeepIds.push(match.id);
          updateOperations.push({
            where: { id: match.id },
            data: { stock: parseInt(v.stock) }
          });
        } else {
          createOperations.push({
            size: v.size,
            color: v.color || null,
            stock: parseInt(v.stock)
          });
        }
      }

      const deleteOperations = existingVariants
        .filter(ev => !variantsToKeepIds.includes(ev.id))
        .map(ev => ev.id);

      updateData.variants = {
        update: updateOperations,
        create: createOperations,
      };
      if (deleteOperations.length > 0) {
        updateData.variants.deleteMany = { id: { in: deleteOperations } };
      }
    }

    const updatedProduct = await productService.updateProduct(
      id,
      updateData
    );

    res.status(200).json({
      status: "OK",
      message: "Success Update Product",
      data: updatedProduct,
    });
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("sku")) {
      return res.status(400).json({
        status: "Failed",
        message: "Kode produk (SKU) sudah digunakan oleh produk lain",
      });
    }
    res.status(500).json({
      status: "Failed",
      message: "Failed To Update Product",
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await productService.getProductById(id);

    if (!existing) {
      return res.status(404).json({
        status: "Failed",
        message: "Product Not Found",
      });
    }

    // Delete image files
    if (existing.images && existing.images.length > 0) {
      existing.images.forEach((img) => {
        const filePath = path.join(__dirname, "../../public", img.url);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await productService.deleteProduct(id);

    res.status(200).json({
      status: "OK",
      message: "Success Delete Product",
    });
  } catch (error) {
    console.error("[deleteProduct] Error:", error);
    res.status(500).json({
      status: "Failed",
      message: error.message || "Failed To Delete Product",
    });
  }
};

// === Variant Management ===

exports.addVariant = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    const product = await productService.getProductById(productId);

    if (!product) {
      return res.status(404).json({
        status: "Failed",
        message: "Product Not Found",
      });
    }

    const { size, color, stock } = req.body;

    if (!size || !stock) {
      return res.status(400).json({
        status: "Failed",
        message: "Size And Stock Are Required",
      });
    }

    const variant = await productService.addVariant(productId, {
      size,
      color,
      stock,
    });

    res.status(201).json({
      status: "OK",
      message: "Success Add Variant",
      data: variant,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Add Variant",
    });
  }
};

exports.editVariant = async (req, res) => {
  try {
    const variantId = parseInt(req.params.variantId);

    const existing = await productService.getVariantById(variantId);

    if (!existing) {
      return res.status(404).json({
        status: "Failed",
        message: "Variant Not Found",
      });
    }

    const { size, color, stock } = req.body;

    const updatedVariant = await productService.updateVariant(variantId, {
      size,
      color,
      stock,
    });

    res.status(200).json({
      status: "OK",
      message: "Success Update Variant",
      data: updatedVariant,
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Update Variant",
    });
  }
};

exports.removeVariant = async (req, res) => {
  try {
    const variantId = parseInt(req.params.variantId);

    const existing = await productService.getVariantById(variantId);

    if (!existing) {
      return res.status(404).json({
        status: "Failed",
        message: "Variant Not Found",
      });
    }

    await productService.deleteVariant(variantId);

    res.status(200).json({
      status: "OK",
      message: "Success Delete Variant",
    });
  } catch (error) {
    res.status(500).json({
      status: "Failed",
      message: "Failed To Delete Variant",
    });
  }
};