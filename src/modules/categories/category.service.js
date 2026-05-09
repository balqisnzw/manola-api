const prisma = require("../../libs/prisma");

const getCategories = async () => {
  return await prisma.category.findMany({
    orderBy: { id: "asc" },
  });
};

const getCategoryById = async (id) => {
  return await prisma.category.findUnique({
    where: { id },
  });
};

const createCategory = async (data) => {
  return await prisma.category.create({
    data,
  });
};

const updateCategory = async (id, data) => {
  return await prisma.category.update({
    where: { id },
    data,
  });
};

const deleteCategory = async (id) => {
  return await prisma.category.delete({
    where: { id },
  });
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
