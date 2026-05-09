const prisma = require("../../libs/prisma");

const getAllProducts = async (filters = {}) => {
  const { category, minPrice, maxPrice } = filters;
  const where = {};

  if (category) {
    where.category = { name: category };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseInt(minPrice);
    if (maxPrice) where.price.lte = parseInt(maxPrice);
  }

  return await prisma.product.findMany({
    where,
    include: {
      category: true,
      images: true,
      variants: true,
      supplier: true,
    },
    orderBy: { id: "asc" },
  });
};

const getProductById = async (id) => {
  return await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: true,
      variants: true,
      supplier: true,
    },
  });
};

const createProduct = async (data) => {
  return await prisma.product.create({
    data,
    include: {
      category: true,
      images: true,
      variants: true,
      supplier: true,
    },
  });
};

const updateProduct = async (id, data) => {
  return await prisma.product.update({
    where: { id },
    data,
    include: {
      category: true,
      images: true,
      variants: true,
      supplier: true,
    },
  });
};

const deleteProduct = async (id) => {
  return await prisma.product.delete({
    where: { id },
    include: {
      images: true, // Untuk ambil info path gambar agar bisa dihapus dari storage
    },
  });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
