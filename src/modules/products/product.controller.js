const productService = require("./product.service");
const fs = require("fs");
const path = require("path");

exports.getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;

    const products = await productService.getAllProducts({
      category,
      minPrice,
      maxPrice,
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

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, categoryId, supplierId, variants } =
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

    const imagesData = req.files
      ? req.files.map((f) => ({
          url: `/uploads/${f.filename}`,
        }))
      : [];

    const data = {
      name,
      description,
      price: parseInt(price),
      categoryId: categoryId ? parseInt(categoryId) : null,
      supplierId: supplierId ? parseInt(supplierId) : null,
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

    const { name, description, price, categoryId, supplierId, variants } =
      req.body;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseInt(price);
    if (categoryId !== undefined) updateData.categoryId = categoryId ? parseInt(categoryId) : null;

    if (supplierId !== undefined) {
      updateData.supplierId = supplierId ? parseInt(supplierId) : null;
    }

    // Handle image update
    if (req.files && req.files.length > 0) {
      if (existing.images) {
        existing.images.forEach((img) => {
          const filePath = path.join(
            __dirname,
            "../../public",
            img.url
          );

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        });
      }

      updateData.images = {
        deleteMany: {},
        create: req.files.map((f) => ({
          url: `/uploads/${f.filename}`,
        })),
      };
    }

    // Handle variants update
    if (variants) {
      const parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;

      updateData.variants = {
        deleteMany: {},
        create: parsedVariants.map((v) => ({
          size: v.size,
          color: v.color || null,
          stock: parseInt(v.stock),
        })),
      };
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
    res.status(500).json({
      status: "Failed",
      message: "Failed To Delete Product",
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