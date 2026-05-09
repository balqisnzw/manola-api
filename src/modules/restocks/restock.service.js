const prisma = require("../../libs/prisma");

const createRestock = async (data) => {
  const { productVariantId, supplierId, jumlah } = data;

  // Validasi variant ada
  const variant = await prisma.productVariant.findUnique({
    where: { id: productVariantId },
    include: { product: true },
  });

  if (!variant) {
    throw new Error("Product variant tidak ditemukan");
  }

  if (jumlah <= 0) {
    throw new Error("Jumlah restock harus lebih dari 0");
  }

  // Gunakan transaksi: insert restock + increment stok
  return await prisma.$transaction(async (tx) => {
    // Tambah stok di variant
    await tx.productVariant.update({
      where: { id: productVariantId },
      data: { stock: { increment: jumlah } },
    });

    // Simpan data restock
    const restock = await tx.restock.create({
      data: {
        productVariantId,
        supplierId: supplierId || null,
        jumlah,
      },
      include: {
        variant: {
          include: { product: true },
        },
        supplier: true,
      },
    });

    return restock;
  });
};

const getAllRestocks = async (filters = {}) => {
  const { productVariantId, supplierId } = filters;
  const where = {};

  if (productVariantId) where.productVariantId = parseInt(productVariantId);
  if (supplierId) where.supplierId = parseInt(supplierId);

  return await prisma.restock.findMany({
    where,
    include: {
      variant: {
        include: { product: true },
      },
      supplier: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

module.exports = {
  createRestock,
  getAllRestocks,
};
