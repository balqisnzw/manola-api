const prisma = require("../../libs/prisma");

const createPayment = async (data) => {
  const { orderId, metode_pembayaran } = data;

  // Cek apakah order ada
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order) {
    throw new Error("Order tidak ditemukan");
  }

  // Cek apakah payment sudah pernah dibuat untuk order ini
  if (order.payment) {
    throw new Error("Pembayaran untuk order ini sudah ada");
  }

  // Validasi metode pembayaran
  const allowedMethods = ["CASH", "QRIS", "MIDTRANS"];
  if (!allowedMethods.includes(metode_pembayaran)) {
    throw new Error(`Metode pembayaran tidak valid. Harus salah satu dari: ${allowedMethods.join(", ")}`);
  }

  // Untuk pesanan offline, hanya boleh CASH atau QRIS
  if (order.jenis === "OFFLINE" && metode_pembayaran === "MIDTRANS") {
    throw new Error("Pesanan offline tidak bisa menggunakan metode pembayaran Midtrans");
  }

  // Buat payment
  const paymentData = {
    orderId,
    metode_pembayaran,
    // Untuk CASH dan QRIS (offline), langsung set status BERHASIL
    status_pembayaran:
      metode_pembayaran === "CASH" || metode_pembayaran === "QRIS"
        ? "BERHASIL"
        : "MENUNGGU",
    midtrans_token: null, // Akan diisi saat integrasi Midtrans nanti
  };

  return await prisma.payment.create({
    data: paymentData,
    include: {
      order: {
        include: {
          items: {
            include: { product: true },
          },
          user: {
            select: { id: true, nama: true, email: true },
          },
        },
      },
    },
  });
};

const getAllPayments = async (filters = {}) => {
  const { status_pembayaran, metode_pembayaran } = filters;
  const where = {};

  if (status_pembayaran) where.status_pembayaran = status_pembayaran;
  if (metode_pembayaran) where.metode_pembayaran = metode_pembayaran;

  return await prisma.payment.findMany({
    where,
    include: {
      order: {
        include: {
          items: {
            include: { product: true },
          },
          user: {
            select: { id: true, nama: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getPaymentById = async (id) => {
  return await prisma.payment.findUnique({
    where: { id },
    include: {
      order: {
        include: {
          items: {
            include: { product: true },
          },
          user: {
            select: { id: true, nama: true, email: true },
          },
        },
      },
    },
  });
};

const updatePaymentStatus = async (id, status_pembayaran) => {
  const allowedStatuses = ["MENUNGGU", "BERHASIL", "GAGAL"];
  if (!allowedStatuses.includes(status_pembayaran)) {
    throw new Error(`Status pembayaran tidak valid. Harus salah satu dari: ${allowedStatuses.join(", ")}`);
  }

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) {
    throw new Error("Payment tidak ditemukan");
  }

  return await prisma.payment.update({
    where: { id },
    data: { status_pembayaran },
    include: {
      order: {
        include: {
          items: {
            include: { product: true },
          },
          user: {
            select: { id: true, nama: true, email: true },
          },
        },
      },
    },
  });
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
};
