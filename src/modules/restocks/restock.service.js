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
  const restock = await prisma.$transaction(async (tx) => {
    // Tambah stok di variant
    await tx.productVariant.update({
      where: { id: productVariantId },
      data: { stock: { increment: jumlah } },
    });

    // Simpan data restock
    const newRestock = await tx.restock.create({
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

    return newRestock;
  });

  // Auto-delete riwayat lama jika total melebihi 100
  const totalCount = await prisma.restock.count();
  if (totalCount > 100) {
    const kelebihan = totalCount - 100;
    const riwayatLama = await prisma.restock.findMany({
      orderBy: { createdAt: "asc" },
      take: kelebihan,
      select: { id: true },
    });
    const idLama = riwayatLama.map((r) => r.id);
    await prisma.restock.deleteMany({
      where: { id: { in: idLama } },
    });
  }

  return restock;
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

const deleteRestock = async (id) => {
  // Cek apakah riwayat restock ada
  const restock = await prisma.restock.findUnique({
    where: { id },
  });

  if (!restock) {
    throw new Error("Riwayat restock tidak ditemukan");
  }

  // Gunakan transaksi: kurangi stok variant + hapus riwayat
  return await prisma.$transaction(async (tx) => {
    // Kurangi stok di variant sebesar jumlah yang direstock
    await tx.productVariant.update({
      where: { id: restock.productVariantId },
      data: { stock: { decrement: restock.jumlah } },
    });

    // Hapus riwayat restock
    const deleted = await tx.restock.delete({
      where: { id },
      include: {
        variant: {
          include: { product: true },
        },
        supplier: true,
      },
    });

    return deleted;
  });
};

module.exports = {
  createRestock,
  getAllRestocks,
  deleteRestock,
};
