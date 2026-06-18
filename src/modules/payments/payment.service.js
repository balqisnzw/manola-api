const prisma = require("../../libs/prisma");
const midtransClient = require("midtrans-client");

// Inisialisasi Midtrans Snap
let snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

const createPayment = async (data) => {
  const { orderId, metode_pembayaran } = data;

  // Cek apakah order ada
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { 
      payment: true,
      items: true,
      user: true
    },
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
  let midtrans_token = null;
  let midtrans_order_id = null;
  const status_pembayaran = metode_pembayaran === "CASH" || metode_pembayaran === "QRIS" ? "BERHASIL" : "MENUNGGU";

  // Integrasi Midtrans
  if (metode_pembayaran === "MIDTRANS") {
    const total_harga = order.items.reduce((sum, item) => sum + (item.harga_satuan * item.jumlah), 0) + (order.ongkos_kirim || 0);
    const order_id = `ORDER-${orderId}-${Date.now()}`;
    
    let parameter = {
      transaction_details: {
        order_id,
        gross_amount: total_harga
      },
      customer_details: {
        first_name: order.user?.nama || "Guest",
        email: order.user?.email || "guest@example.com",
      }
    };

    try {
      const transaction = await snap.createTransaction(parameter);
      midtrans_token = transaction.token;
      midtrans_order_id = order_id;
    } catch (e) {
      throw new Error("Gagal membuat token Midtrans: " + e.message);
    }
  }

  const paymentData = {
    orderId,
    metode_pembayaran,
    status_pembayaran,
    midtrans_token,
    midtrans_order_id,
  };

  // Integrasi Shift Kasir & penyelesaian order otomatis jika offline
  if (order.kasirId && (metode_pembayaran === "CASH" || metode_pembayaran === "QRIS")) {
    const activeShift = await prisma.cashierShift.findFirst({
      where: { kasirId: order.kasirId, selesai: null },
    });
    if (activeShift) {
      const fieldToIncrement = metode_pembayaran === "CASH" ? "total_cash" : "total_qris";
      await prisma.cashierShift.update({
        where: { id: activeShift.id },
        data: {
          [fieldToIncrement]: { increment: order.total_harga },
        },
      });
    }
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "SELESAI" },
    });
  }

  return await prisma.payment.create({
    data: paymentData,
    include: {
      order: {
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
            include: {
              variant: {
                include: { product: true },
              },
            },
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
            include: {
              variant: {
                include: { product: true },
              },
            },
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
            include: {
              variant: {
                include: { product: true },
              },
            },
          },
          user: {
            select: { id: true, nama: true, email: true },
          },
        },
      },
    },
  });
};

const processTransactionStatus = async (statusResponse) => {
  const orderIdStr = statusResponse.order_id;
  const transactionStatus = statusResponse.transaction_status;
  const fraudStatus = statusResponse.fraud_status;
  let paymentType = statusResponse.payment_type;
  if (paymentType === 'bank_transfer') {
    if (statusResponse.va_numbers && statusResponse.va_numbers.length > 0) {
      paymentType = `${statusResponse.va_numbers[0].bank.toUpperCase()} VA`;
    } else if (statusResponse.permata_va_number) {
      paymentType = 'Permata VA';
    }
  } else if (paymentType === 'echannel') {
    paymentType = 'Mandiri VA';
  } else if (paymentType === 'cstore') {
    paymentType = statusResponse.store ? statusResponse.store.toUpperCase() : 'Minimarket';
  } else if (paymentType === 'qris') {
    paymentType = 'QRIS';
  } else if (paymentType === 'gopay') {
    paymentType = 'GoPay';
  } else if (paymentType === 'shopeepay') {
    paymentType = 'ShopeePay';
  } else if (paymentType === 'credit_card') {
    paymentType = 'Kartu Kredit';
  }
  
  // orderIdStr formatnya "ORDER-{ID}-timestamp", kita ambil ID-nya
  const orderId = parseInt(orderIdStr.split('-')[1]);

  let newStatus = "MENUNGGU";
  if (transactionStatus == 'capture' || transactionStatus == 'settlement') {
    newStatus = 'BERHASIL';
  } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
    newStatus = 'GAGAL';
  } else if (transactionStatus == 'pending') {
    newStatus = 'MENUNGGU';
  }

  // Update payment & handle restock if failed
  const payment = await prisma.payment.findFirst({
    where: { orderId },
    include: { order: { include: { items: true } } },
  });

  if (payment && payment.status_pembayaran !== newStatus) {
    if (newStatus === "GAGAL" && payment.status_pembayaran === "MENUNGGU") {
      // Kembalikan stok dalam satu transaksi
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status_pembayaran: newStatus, midtrans_payment_type: paymentType },
        }),
        ...payment.order.items.map((item) =>
          prisma.productVariant.update({
            where: { id: item.productVariantId },
            data: { stock: { increment: item.jumlah } },
          })
        ),
      ]);
    } else {
      const transactionOps = [
        prisma.payment.update({
          where: { id: payment.id },
          data: { status_pembayaran: newStatus, midtrans_payment_type: paymentType },
        })
      ];
      if (newStatus === "BERHASIL") {
        transactionOps.push(
          prisma.order.update({
            where: { id: orderId },
            data: { 
              status: "DIKEMAS",
              dikemasAt: new Date()
            }
          })
        );
      }
      await prisma.$transaction(transactionOps);
    }
  }
  return true;
};

const handleMidtransNotification = async (notificationJson) => {
  try {
    const statusResponse = await snap.transaction.notification(notificationJson);
    return await processTransactionStatus(statusResponse);
  } catch (error) {
    throw error;
  }
};

const syncPaymentStatusFromMidtrans = async (orderId) => {
  const payment = await prisma.payment.findUnique({
    where: { orderId: parseInt(orderId) },
    include: { order: { include: { items: true } } }
  });

  if (!payment || payment.metode_pembayaran !== "MIDTRANS") {
    throw new Error("Pembayaran tidak ditemukan atau bukan Midtrans");
  }

  if (!payment.midtrans_order_id) {
    return payment;
  }

  try {
    const statusResponse = await snap.transaction.status(payment.midtrans_order_id);
    await processTransactionStatus(statusResponse);
  } catch (err) {
    // Abaikan jika error dari Midtrans adalah 404 (transaksi belum terbentuk/belum bayar)
    if (err.httpStatusCode !== 404) {
      console.error("Gagal sinkronisasi manual dari Midtrans:", err.message);
    }
  }
};

const regenerateMidtransToken = async (orderId) => {
  const payment = await prisma.payment.findUnique({
    where: { orderId: parseInt(orderId) },
    include: { order: { include: { items: true, user: true } } },
  });

  if (!payment || payment.metode_pembayaran !== "MIDTRANS") {
    throw new Error("Bukan pembayaran Midtrans");
  }

  if (payment.status_pembayaran !== "MENUNGGU") {
    throw new Error("Pembayaran tidak dalam status MENUNGGU");
  }

  const total_harga =
    payment.order.items.reduce((sum, item) => sum + item.harga_satuan * item.jumlah, 0) +
    (payment.order.ongkos_kirim || 0);

  const order_id = `ORDER-${orderId}-${Date.now()}`;
  const parameter = {
    transaction_details: {
      order_id,
      gross_amount: total_harga,
    },
    customer_details: {
      first_name: payment.order.user?.nama || "Guest",
      email: payment.order.user?.email || "guest@example.com",
    },
  };

  const transaction = await snap.createTransaction(parameter);
  
  return await prisma.payment.update({
    where: { id: payment.id },
    data: { 
      midtrans_token: transaction.token,
      midtrans_order_id: order_id,
    },
  });
};

const cancelPayment = async (orderId, userId) => {
  const payment = await prisma.payment.findUnique({
    where: { orderId: parseInt(orderId) },
    include: { order: { include: { items: true } } }
  });

  if (!payment) {
    throw new Error("Data pembayaran tidak ditemukan");
  }

  if (userId && payment.order.userId !== userId) {
    throw new Error("Anda tidak memiliki akses untuk membatalkan pesanan ini");
  }

  if (payment.status_pembayaran !== "MENUNGGU") {
    throw new Error("Hanya pesanan yang menunggu pembayaran yang dapat dibatalkan");
  }

  if (payment.midtrans_order_id && payment.metode_pembayaran === "MIDTRANS") {
    try {
      await snap.transaction.cancel(payment.midtrans_order_id);
    } catch (err) {
      console.error("Gagal membatalkan transaksi di Midtrans:", err.message);
    }
  }

  return await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: { status_pembayaran: "GAGAL" }
    });

    for (const item of payment.order.items) {
      await tx.productVariant.update({
        where: { id: item.productVariantId },
        data: { stock: { increment: item.jumlah } }
      });
    }

    return updatedPayment;
  });
};

const autoCancelExpiredPayments = async () => {
  const timeThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 jam yang lalu

  const expiredPayments = await prisma.payment.findMany({
    where: {
      status_pembayaran: "MENUNGGU",
      createdAt: {
        lt: timeThreshold,
      },
    },
    include: {
      order: {
        include: {
          items: true,
        },
      },
    },
  });

  if (expiredPayments.length === 0) return [];

  const results = [];
  for (const payment of expiredPayments) {
    try {
      // Batalkan di Midtrans jika ada token/order id
      if (payment.midtrans_order_id && payment.metode_pembayaran === "MIDTRANS") {
        try {
          await snap.transaction.cancel(payment.midtrans_order_id);
        } catch (midtransErr) {
          console.error(`[Auto-Cancel] Gagal membatalkan di Midtrans untuk Order #${payment.orderId}:`, midtransErr.message);
        }
      }

      // Jalankan db transaction untuk update status & kembalikan stok
      const updated = await prisma.$transaction(async (tx) => {
        const updatedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: { status_pembayaran: "GAGAL" },
        });

        for (const item of payment.order.items) {
          await tx.productVariant.update({
            where: { id: item.productVariantId },
            data: { stock: { increment: item.jumlah } },
          });
        }
        return updatedPayment;
      });

      console.log(`[Auto-Cancel] Berhasil membatalkan Order #${payment.orderId} karena kedaluwarsa.`);
      results.push(updated);
    } catch (err) {
      console.error(`[Auto-Cancel] Gagal membatalkan Order #${payment.orderId}:`, err.message);
    }
  }

  return results;
};

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  handleMidtransNotification,
  syncPaymentStatusFromMidtrans,
  regenerateMidtransToken,
  cancelPayment,
  autoCancelExpiredPayments,
};

