const prisma = require("../../libs/prisma");
const orderService = require("../orders/order.service");

const createReturnRequest = async (orderId, alasan, keterangan, bukti_url, imageUrls = []) => {
  // Pastikan pesanan ada dan berstatus SELESAI
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order tidak ditemukan");
  if (order.status !== "SELESAI") throw new Error("Pengembalian hanya untuk pesanan berstatus SELESAI");

  // Cek apakah pengajuan melebihi 1x24 jam sejak pesanan selesai
  const timeLimit = 24 * 60 * 60 * 1000; // 24 jam dalam milidetik
  const orderFinishedAt = new Date(order.updatedAt).getTime();
  const now = new Date().getTime();
  if (now - orderFinishedAt > timeLimit) {
    throw new Error("Batas waktu pengajuan pengembalian (1x24 jam setelah barang diterima) telah habis.");
  }

  // Cek apakah sudah ada pengajuan
  const existing = await prisma.returnRequest.findUnique({ where: { orderId } });
  if (existing) throw new Error("Pengajuan pengembalian untuk pesanan ini sudah ada");

  return await prisma.returnRequest.create({
    data: {
      orderId,
      alasan,
      keterangan,
      bukti_url,
      images: {
        create: imageUrls.map((url) => ({ url })),
      },
    },
    include: { images: true },
  });
};

const getAllReturnRequests = async () => {
  return await prisma.returnRequest.findMany({
    include: {
      images: true,
      order: {
        include: {
          user: { select: { nama: true, email: true, no_telepon: true } },
          items: {
            include: {
              variant: { include: { product: { include: { images: true } } } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateReturnRequestStatus = async (id, status) => {
  const allowed = ["MENUNGGU", "DISETUJUI", "DITOLAK"];
  if (!allowed.includes(status)) throw new Error("Status tidak valid");

  const returnReq = await prisma.returnRequest.findUnique({ where: { id } });
  if (!returnReq) throw new Error("Return request tidak ditemukan");

  const updatedReq = await prisma.returnRequest.update({
    where: { id },
    data: { status },
  });

  // Saat disetujui, TIDAK lagi langsung mengubah status order ke DIKEMBALIKAN.
  // Pelanggan harus memasukkan resi dulu, lalu admin konfirmasi paket sampai.

  return updatedReq;
};

// Pelanggan memasukkan nomor resi pengiriman retur
const updateReturnResi = async (id, resi) => {
  if (!resi || resi.trim() === "") throw new Error("Nomor resi wajib diisi");

  const returnReq = await prisma.returnRequest.findUnique({ where: { id } });
  if (!returnReq) throw new Error("Return request tidak ditemukan");
  if (returnReq.status !== "DISETUJUI") {
    throw new Error("Resi hanya bisa dimasukkan setelah pengajuan disetujui admin");
  }

  return await prisma.returnRequest.update({
    where: { id },
    data: { resi: resi.trim(), status: "DIKIRIM" },
  });
};

// Admin mengkonfirmasi paket retur sudah sampai di gudang
const confirmReturnReceived = async (id) => {
  const returnReq = await prisma.returnRequest.findUnique({ where: { id } });
  if (!returnReq) throw new Error("Return request tidak ditemukan");
  if (returnReq.status !== "DIKIRIM") {
    throw new Error("Konfirmasi hanya bisa dilakukan setelah pelanggan mengirim resi");
  }

  // Update status retur menjadi SELESAI
  const updatedReq = await prisma.returnRequest.update({
    where: { id },
    data: { status: "SELESAI" },
  });

  // Sekarang baru update order ke DIKEMBALIKAN (trigger stok increment otomatis)
  await orderService.updateOrderStatus(returnReq.orderId, "DIKEMBALIKAN", null);

  // Hapus semua ulasan yang terkait dengan pesanan ini jika ada
  await prisma.review.deleteMany({
    where: { orderId: returnReq.orderId }
  });

  return updatedReq;
};

module.exports = {
  createReturnRequest,
  getAllReturnRequests,
  updateReturnRequestStatus,
  updateReturnResi,
  confirmReturnReceived,
};
