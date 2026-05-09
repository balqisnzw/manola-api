const productService = require("./product.service");
const fs = require("fs");
const path = require("path");

exports.getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    const products = await productService.getAllProducts({ category, minPrice, maxPrice });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, categoryId, supplierId, variants } = req.body;

    let variantsData = [];
    if (variants) {
      // variants dikirim sebagai JSON string jika via form-data
      const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
      variantsData = parsedVariants.map(v => ({ size: v.size, color: v.color || null, stock: parseInt(v.stock) }));
    }

    const imagesData = req.files ? req.files.map(f => ({ url: `/uploads/${f.filename}` })) : [];

    const data = {
      name,
      description,
      price: parseInt(price),
      category: categoryId ? { connect: { id: parseInt(categoryId) } } : undefined,
      supplier: supplierId ? { connect: { id: parseInt(supplierId) } } : undefined,
      images: {
        create: imagesData,
      },
      variants: {
        create: variantsData,
      },
    };

    const newProduct = await productService.createProduct(data);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await productService.getProductById(id);

    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { name, description, price, categoryId, supplierId, variants } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseInt(price);
    if (categoryId !== undefined) {
      updateData.category = categoryId ? { connect: { id: parseInt(categoryId) } } : { disconnect: true };
    }
    if (supplierId !== undefined) {
      updateData.supplier = supplierId ? { connect: { id: parseInt(supplierId) } } : { disconnect: true };
    }

    // Handle image update
    if (req.files && req.files.length > 0) {
      // Delete old files from storage
      if (existing.images) {
        existing.images.forEach(img => {
          const filePath = path.join(__dirname, "../../public", img.url);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
      }
      updateData.images = {
        deleteMany: {},
        create: req.files.map(f => ({ url: `/uploads/${f.filename}` })),
      };
    }

    // Handle variants update
    if (variants) {
      const parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
      updateData.variants = {
        deleteMany: {},
        create: parsedVariants.map(v => ({ size: v.size, color: v.color || null, stock: parseInt(v.stock) })),
      };
    }

    const updatedProduct = await productService.updateProduct(id, updateData);
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await productService.getProductById(id);

    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Hapus file gambar dari public folder
    if (existing.images && existing.images.length > 0) {
      existing.images.forEach(img => {
        const filePath = path.join(__dirname, "../../public", img.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await productService.deleteProduct(id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};