const prisma = require("../../libs/prisma");

const createOrder = async (data) => {
  const { userId, kasirId, jenis, alamat_pengiriman, ongkos_kirim, catatan, items } = data;

  // Validasi: pesanan online wajib punya alamat pengiriman
  if (jenis === "ONLINE" && !alamat_pengiriman) {
    throw new Error("Alamat pengiriman wajib diisi untuk pesanan online");
  }

  // Validasi: pesanan online wajib punya ongkos kirim
  if (jenis === "ONLINE" && (ongkos_kirim === undefined || ongkos_kirim === null)) {
    throw new Error("Ongkos kirim wajib diisi untuk pesanan online");
  }

  // Validasi items tidak boleh kosong
  if (!items || items.length === 0) {
    throw new Error("Pesanan harus memiliki minimal 1 item");
  }

  // Gunakan Prisma transaction untuk memastikan atomicity
  return await prisma.$transaction(async (tx) => {
    // 1. Validasi stok dan ambil data harga untuk setiap item
    let total_harga = 0;
    const orderItemsData = [];

    for (const item of items) {
      const { variantId, jumlah } = item;

      // Cari variant beserta data produk induknya
      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
        include: { product: true },
      });

      if (!variant) {
        throw new Error(`Variant dengan ID ${variantId} tidak ditemukan`);
      }

      if (variant.stock < jumlah) {
        throw new Error(
          `Stok tidak cukup untuk produk "${variant.product.name}" (variant: ${variant.size}${variant.color ? ", " + variant.color : ""}). Stok tersedia: ${variant.stock}, diminta: ${jumlah}`
        );
      }

      // 2. Kurangi stok
      await tx.productVariant.update({
        where: { id: variantId },
        data: { stock: { decrement: jumlah } },
      });

      const harga_satuan = variant.product.price;
      total_harga += harga_satuan * jumlah;

      orderItemsData.push({
        productVariantId: variantId,
        jumlah,
        harga_satuan,
      });
    }

    // Tambahkan ongkos kirim ke total (untuk pesanan online)
    const finalOngkosKirim = jenis === "ONLINE" ? (ongkos_kirim || 0) : null;
    if (finalOngkosKirim) {
      total_harga += finalOngkosKirim;
    }

    // 3. Buat order beserta items
    const order = await tx.order.create({
      data: {
        userId: userId || null,
        kasirId: kasirId || null,
        total_harga,
        ongkos_kirim: finalOngkosKirim,
        status: "DIPROSES",
        jenis,
        alamat_pengiriman: jenis === "ONLINE" ? alamat_pengiriman : null,
        catatan: catatan || null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        user: {
          select: { id: true, nama: true, email: true },
        },
        kasir: {
          select: { id: true, nama: true },
        },
      },
    });

    return order;
  });
};

const getAllOrders = async (filters = {}) => {
  const { status, jenis, userId } = filters;
  const where = {};

  if (status) where.status = status;
  if (jenis) where.jenis = jenis;
  if (userId) where.userId = parseInt(userId);

  return await prisma.order.findMany({
    where,
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
      user: {
        select: { id: true, nama: true, email: true },
      },
      kasir: {
        select: { id: true, nama: true },
      },
      packagingStaff: {
        select: { id: true, nama: true },
      },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getOrderById = async (id) => {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
      user: {
        select: { id: true, nama: true, email: true },
      },
      kasir: {
        select: { id: true, nama: true },
      },
      packagingStaff: {
        select: { id: true, nama: true },
      },
      payment: true,
    },
  });
};

const updateOrderStatus = async (id, status, packagingId) => {
  // Validasi status yang diperbolehkan
  const allowedStatuses = ["DIPROSES", "DIKEMAS", "DIKIRIM", "SELESAI"];
  if (!allowedStatuses.includes(status)) {
    throw new Error(`Status tidak valid. Harus salah satu dari: ${allowedStatuses.join(", ")}`);
  }

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) {
    throw new Error("Order tidak ditemukan");
  }

  // Siapkan data update
  const updateData = { status };

  // Otomatis isi packagingId saat status diubah ke DIKEMAS
  if (status === "DIKEMAS" && packagingId) {
    updateData.packagingId = packagingId;
  }

  return await prisma.order.update({
    where: { id },
    data: updateData,
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
      user: {
        select: { id: true, nama: true, email: true },
      },
      kasir: {
        select: { id: true, nama: true },
      },
      packagingStaff: {
        select: { id: true, nama: true },
      },
      payment: true,
    },
  });
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
};
