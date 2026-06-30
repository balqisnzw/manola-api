const prisma = require("../../libs/prisma");

const getAllProducts = async (filters = {}) => {
  const { category, minPrice, maxPrice, size, color } = filters;
  const where = {};

  if (category) {
    where.category = {
      nama: { contains: category, mode: "insensitive" }
    };
  }

  if (size) {
    where.variants = {
      some: {
        size: { equals: size, mode: "insensitive" }
      }
    };
  }

  if (color) {
    where.OR = [
      { colorTags: { contains: color, mode: "insensitive" } },
      { name: { contains: color, mode: "insensitive" } },
      { description: { contains: color, mode: "insensitive" } },
      { variants: { some: { color: { contains: color, mode: "insensitive" } } } }
    ];
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseInt(minPrice);
    if (maxPrice) where.price.lte = parseInt(maxPrice);
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      images: true,
      variants: {
        include: {
          orderItems: {
            include: {
              order: {
                select: { status: true }
              }
            }
          }
        }
      },
      supplier: true,
      category: true,
      reviews: { select: { rating: true } },
    },
    orderBy: { id: "asc" },
  });
  return products.map(mapProduct);
};

const getProductById = async (id) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: true,
      variants: {
        include: {
          orderItems: {
            include: {
              order: {
                select: { status: true }
              }
            }
          }
        }
      },
      supplier: true,
      category: true,
      reviews: { select: { rating: true } },
    },
  });
  return mapProduct(product);
};

const createProduct = async (data) => {
  const product = await prisma.product.create({
    data,
    include: {
      images: true,
      variants: true,
      supplier: true,
      category: true,
      reviews: { select: { rating: true } },
    },
  });
  return mapProduct(product);
};

const updateProduct = async (id, data) => {
  const product = await prisma.product.update({
    where: { id },
    data,
    include: {
      images: true,
      variants: true,
      supplier: true,
      category: true,
      reviews: { select: { rating: true } },
    },
  });
  return mapProduct(product);
};

const deleteProduct = async (id) => {
  return await prisma.product.delete({
    where: { id },
    include: {
      images: true, // Untuk ambil info path gambar agar bisa dihapus dari storage
    },
  });
};

// === Variant Management ===

const addVariant = async (productId, variantData) => {
  return await prisma.productVariant.create({
    data: {
      productId,
      size: variantData.size,
      color: variantData.color || null,
      stock: parseInt(variantData.stock),
    },
  });
};

const updateVariant = async (variantId, variantData) => {
  const data = {};
  if (variantData.size !== undefined) data.size = variantData.size;
  if (variantData.color !== undefined) data.color = variantData.color;
  if (variantData.stock !== undefined) data.stock = parseInt(variantData.stock);

  return await prisma.productVariant.update({
    where: { id: variantId },
    data,
  });
};

const deleteVariant = async (variantId) => {
  return await prisma.productVariant.delete({
    where: { id: variantId },
  });
};

const getVariantById = async (variantId) => {
  return await prisma.productVariant.findUnique({
    where: { id: variantId },
  });
};

const getSkuSuggestion = async () => {
  const lastProduct = await prisma.product.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });
  const nextNumber = (lastProduct ? lastProduct.id : 0) + 1;
  return `PRD-${String(nextNumber).padStart(4, "0")}`;
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  getVariantById,
  getSkuSuggestion,
};

const mapProduct = (p) => {
  if (!p) return null;
  const { category, reviews, variants, ...rest } = p;
  
  let rating = 0;
  if (reviews && reviews.length > 0) {
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    rating = Number((totalRating / reviews.length).toFixed(1));
  }

  let sold = 0;
  if (variants && variants.length > 0) {
    variants.forEach(variant => {
      if (variant.orderItems && variant.orderItems.length > 0) {
        variant.orderItems.forEach(item => {
          if (item.order && item.order.status === 'SELESAI') {
            sold += item.jumlah;
          }
        });
      }
    });
  }

  const cleanedVariants = variants ? variants.map(v => {
    const { orderItems, ...vRest } = v;
    return vRest;
  }) : [];

  return {
    ...rest,
    category: category ? category.nama : null,
    rating,
    sold,
    variants: cleanedVariants
  };
};
