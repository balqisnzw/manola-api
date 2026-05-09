const prisma = require("../../libs/prisma");

const addToWishlist = async (userId, productId) => {
  // Cek produk ada
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new Error("Produk tidak ditemukan");
  }

  // Cek apakah sudah ada di wishlist (unique constraint akan menangani ini juga)
  const existing = await prisma.wishlist.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    throw new Error("Produk sudah ada di wishlist");
  }

  return await prisma.wishlist.create({
    data: { userId, productId },
    include: {
      product: {
        include: { images: true },
      },
    },
  });
};

const getWishlistByUser = async (userId) => {
  return await prisma.wishlist.findMany({
    where: { userId },
    include: {
      product: {
        include: { images: true, variants: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const removeFromWishlist = async (id, userId) => {
  const wishlist = await prisma.wishlist.findUnique({ where: { id } });

  if (!wishlist) {
    throw new Error("Wishlist item tidak ditemukan");
  }

  if (wishlist.userId !== userId) {
    throw new Error("Akses ditolak");
  }

  return await prisma.wishlist.delete({ where: { id } });
};

module.exports = {
  addToWishlist,
  getWishlistByUser,
  removeFromWishlist,
};
