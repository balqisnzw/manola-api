const prisma = require("../../libs/prisma");

const createReview = async (data) => {
  const { userId, productId, orderId, rating, komentar } = data;

  // Validasi rating
  if (rating < 1 || rating > 5) {
    throw new Error("Rating harus antara 1 sampai 5");
  }

  // Cek apakah order milik user dan statusnya SELESAI
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order tidak ditemukan");
  }

  if (order.userId !== userId) {
    throw new Error("Order ini bukan milik Anda");
  }

  if (order.status !== "SELESAI") {
    throw new Error("Anda hanya bisa memberikan ulasan untuk order yang sudah selesai");
  }

  // Cek apakah product ada di dalam order items (melalui variant)
  const productInOrder = order.items.some((item) => item.variant.productId === productId);
  if (!productInOrder) {
    throw new Error("Produk ini tidak ada dalam order tersebut");
  }

  // Cek apakah sudah pernah review (unique constraint)
  const existingReview = await prisma.review.findUnique({
    where: { userId_productId_orderId: { userId, productId, orderId } },
  });

  if (existingReview) {
    throw new Error("Anda sudah memberikan ulasan untuk produk ini pada order tersebut");
  }

  return await prisma.review.create({
    data: {
      userId,
      productId,
      orderId,
      rating,
      komentar: komentar || null,
    },
    include: {
      user: {
        select: { id: true, nama: true },
      },
      product: {
        select: { id: true, name: true },
      },
    },
  });
};

const getReviewsByProduct = async (productId) => {
  return await prisma.review.findMany({
    where: { productId },
    include: {
      user: {
        select: { id: true, nama: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

module.exports = {
  createReview,
  getReviewsByProduct,
};
