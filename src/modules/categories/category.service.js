const prisma = require("../../libs/prisma");

const createCategory = async (nama) => {
  const existing = await prisma.category.findUnique({ where: { nama } });
  if (existing) throw new Error("Kategori sudah ada");
  return await prisma.category.create({ data: { nama } });
};

const getAllCategories = async () => {
  return await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { nama: "asc" },
  });
};

const updateCategory = async (id, nama) => {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) throw new Error("Kategori tidak ditemukan");
  return await prisma.category.update({ where: { id }, data: { nama } });
};

const deleteCategory = async (id) => {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) throw new Error("Kategori tidak ditemukan");
  // Set null pada produk yang menggunakan kategori ini
  await prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
  return await prisma.category.delete({ where: { id } });
};

module.exports = { createCategory, getAllCategories, updateCategory, deleteCategory };
