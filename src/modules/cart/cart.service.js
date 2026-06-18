const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Memastikan user memiliki keranjang (Cart)
const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  return cart;
};

// Mendapatkan keranjang user (format disesuaikan dengan CartItem di frontend)
exports.getCartByUser = async (userId) => {
  const cart = await getOrCreateCart(userId);

  // Mapping ke format yang dikenali oleh frontend CartContext
  const formattedItems = cart.items.map((item) => {
    const product = item.variant.product;
    const firstImage = product.images?.[0]?.url || "";
    
    return {
      id: item.id,
      cartId: item.cartId,
      variantId: item.productVariantId,
      productId: product.id,
      name: product.name,
      price: product.promoPrice || product.price,
      image: firstImage,
      size: item.variant.size,
      color: item.variant.color || "",
      quantity: item.quantity,
      stock: item.variant.stock,
    };
  });

  return formattedItems;
};

// Menambahkan item ke keranjang
exports.addToCart = async (userId, variantId, quantity) => {
  const cart = await getOrCreateCart(userId);

  // Cek apakah variant ada dan stock mencukupi
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!variant) throw new Error("Variant produk tidak ditemukan");
  if (variant.stock < quantity) throw new Error("Stok produk tidak mencukupi");

  // Cek apakah item sudah ada di keranjang
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productVariantId: {
        cartId: cart.id,
        productVariantId: variantId,
      },
    },
  });

  if (existingItem) {
    // Update quantity (limit ke max stock)
    const newQty = Math.min(existingItem.quantity + quantity, variant.stock);
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: newQty },
    });
  } else {
    // Tambah item baru
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productVariantId: variantId,
        quantity: Math.min(quantity, variant.stock),
      },
    });
  }

  return this.getCartByUser(userId);
};

// Update quantity item di keranjang
exports.updateCartItem = async (userId, variantId, quantity) => {
  const cart = await getOrCreateCart(userId);

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
  });

  if (!variant) throw new Error("Variant produk tidak ditemukan");

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productVariantId: {
        cartId: cart.id,
        productVariantId: variantId,
      },
    },
  });

  if (!existingItem) throw new Error("Item tidak ada di keranjang");

  const newQty = Math.max(1, Math.min(quantity, variant.stock));

  await prisma.cartItem.update({
    where: { id: existingItem.id },
    data: { quantity: newQty },
  });

  return this.getCartByUser(userId);
};

// Menghapus item dari keranjang
exports.removeFromCart = async (userId, variantId) => {
  const cart = await getOrCreateCart(userId);

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productVariantId: {
        cartId: cart.id,
        productVariantId: parseInt(variantId),
      },
    },
  });

  if (existingItem) {
    await prisma.cartItem.delete({
      where: { id: existingItem.id },
    });
  }

  return this.getCartByUser(userId);
};

// Menghapus seluruh isi keranjang
exports.clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return [];
};
