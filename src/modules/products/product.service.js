const prisma = require("../../libs/prisma");

const getAllProducts = async (filters = {}) => {
  const { category, minPrice, maxPrice } = filters;
  const where = {};

  if (category) {
    where.category = {
      nama: { contains: category, mode: "insensitive" }
    };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseInt(minPrice);
    if (maxPrice) where.price.lte = parseInt(maxPrice);
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      images: true,
      variants: true,
      supplier: true,
      category: true,
    },
    orderBy: { id: "asc" },
  });
  return products.map(mapProduct);
};

const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      variants: true,
      supplier: true,
      category: true,
    },
  });
  return mapProduct(product);
};

const createProduct = async (data) => {
  const product = await prisma.product.create({
    data,
    include: {
      images: true,
      variants: true,
      supplier: true,
      category: true,
    },
  });
  return mapProduct(product);
};

const updateProduct = async (id, data) => {
  const product = await prisma.product.update({
    where: { id },
    data,
    include: {
      images: true,
      variants: true,
      supplier: true,
      category: true,
    },
  });
  return mapProduct(product);
};

const deleteProduct = async (id) => {
  return await prisma.product.delete({
    where: { id },
    include: {
      images: true, // Untuk ambil info path gambar agar bisa dihapus dari storage
    },
  });
};

// === Variant Management ===

const addVariant = async (productId, variantData) => {
  return await prisma.productVariant.create({
    data: {
      productId,
      size: variantData.size,
      color: variantData.color || null,
      stock: parseInt(variantData.stock),
    },
  });
};

const updateVariant = async (variantId, variantData) => {
  const data = {};
  if (variantData.size !== undefined) data.size = variantData.size;
  if (variantData.color !== undefined) data.color = variantData.color;
  if (variantData.stock !== undefined) data.stock = parseInt(variantData.stock);

  return await prisma.productVariant.update({
    where: { id: variantId },
    data,
  });
};

const deleteVariant = async (variantId) => {
  return await prisma.productVariant.delete({
    where: { id: variantId },
  });
};

const getVariantById = async (variantId) => {
  return await prisma.productVariant.findUnique({
    where: { id: variantId },
  });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  getVariantById,
};

const mapProduct = (p) => {
  if (!p) return null;
  const { category, ...rest } = p;
  return {
    ...rest,
    category: category ? category.nama : null,
  };
};
