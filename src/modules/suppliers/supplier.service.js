const prisma = require("../../libs/prisma");

const getAllSuppliers = async () => {
  return await prisma.supplier.findMany({
    orderBy: { id: "asc" },
  });
};

const getSupplierById = async (id) => {
  return await prisma.supplier.findUnique({
    where: { id },
  });
};

const createSupplier = async (data) => {
  return await prisma.supplier.create({
    data,
  });
};

const updateSupplier = async (id, data) => {
  return await prisma.supplier.update({
    where: { id },
    data,
  });
};

const deleteSupplier = async (id) => {
  return await prisma.supplier.delete({
    where: { id },
  });
};

module.exports = {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
