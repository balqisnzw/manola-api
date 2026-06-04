const prisma = require("../../libs/prisma");

const getDashboardData = async () => {
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get all completed orders
  const completedOrders = await prisma.order.findMany({
    where: { status: "SELESAI" },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
  });

  // Get all products with variants for low stock calculation
  const products = await prisma.product.findMany({
    include: {
      variants: true,
    },
  });

  const totalProducts = products.length;

  let yearlyTotal = 0;
  let monthlyTotal = 0;
  let dailyTotal = 0;
  let todayOrderCount = 0;
  const monthlyDataArr = Array(12).fill(0);
  
  const productSales = {};

  completedOrders.forEach(o => {
    const d = new Date(o.createdAt);
    const orderYear = d.getFullYear();
    const orderMonth = d.getMonth();
    
    if (orderYear === thisYear) {
      yearlyTotal += o.total_harga;
      monthlyDataArr[orderMonth] += o.total_harga;
      
      if (orderMonth === thisMonth) {
        monthlyTotal += o.total_harga;
      }
    }
    
    if (d >= todayStart) {
      dailyTotal += o.total_harga;
      todayOrderCount += 1;
    }
    
    // Process items for top products
    o.items.forEach(item => {
      const productName = item.variant?.product?.name || "Unknown";
      const category = item.variant?.product?.category || "-";
      
      if (!productSales[productName]) {
        productSales[productName] = { name: productName, category, sold: 0, revenue: 0 };
      }
      productSales[productName].sold += item.jumlah;
      productSales[productName].revenue += item.harga_satuan * item.jumlah;
    });
  });

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthlyData = months.map((month, idx) => ({
    month,
    value: monthlyDataArr[idx],
  }));

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 10)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  // Find low stock variants (stock <= 3)
  const lowStockProducts = [];
  products.forEach(product => {
    product.variants.forEach(variant => {
      if (variant.stock <= 3) {
        lowStockProducts.push({
          id: variant.id,
          productName: product.name,
          size: variant.size,
          color: variant.color || "-",
          stock: variant.stock,
        });
      }
    });
  });
  lowStockProducts.sort((a, b) => a.stock - b.stock);

  return {
    yearlyTotal,
    monthlyTotal,
    dailyTotal,
    todayOrderCount,
    totalProducts,
    monthlyData,
    topProducts,
    lowStockProducts,
  };
};

module.exports = {
  getDashboardData,
};
