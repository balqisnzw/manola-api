const prisma = require("../../libs/prisma");

const getAllProducts = async () => {
  return await prisma.product.findMany({
    orderBy: { id: "asc" },
  });
};

const getProductById = async (id) => {
  return await prisma.product.findUnique({
    where: { id },
  });
};

const createProduct = async (data) => {
  return await prisma.product.create({
    data,
  });
};

const updateProduct = async (id, data) => {
  return await prisma.product.update({
    where: { id },
    data,
  });
};

const deleteProduct = async (id) => {
  return await prisma.product.delete({
    where: { id },
  });
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
