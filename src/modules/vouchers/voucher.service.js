const prisma = require("../../libs/prisma");

const createVoucher = async (data) => {
  const {
    kode, nama, tipe_diskon, nilai_diskon,
    min_pembelian, max_diskon, kuota,
    tanggal_mulai, tanggal_berakhir, aktif,
  } = data;

  // Cek kode unik
  const existing = await prisma.voucher.findUnique({ where: { kode } });
  if (existing) {
    throw new Error("Kode voucher sudah digunakan");
  }

  return await prisma.voucher.create({
    data: {
      kode,
      nama,
      tipe_diskon,
      nilai_diskon: parseInt(nilai_diskon),
      min_pembelian: min_pembelian ? parseInt(min_pembelian) : null,
      max_diskon: max_diskon ? parseInt(max_diskon) : null,
      kuota: kuota ? parseInt(kuota) : 0,
      tanggal_mulai: new Date(tanggal_mulai),
      tanggal_berakhir: new Date(tanggal_berakhir),
      aktif: aktif !== undefined ? aktif : true,
    },
  });
};

const getAllVouchers = async () => {
  return await prisma.voucher.findMany({
    orderBy: { createdAt: "desc" },
  });
};

const getVoucherById = async (id) => {
  return await prisma.voucher.findUnique({ where: { id } });
};

const updateVoucher = async (id, data) => {
  const voucher = await prisma.voucher.findUnique({ where: { id } });
  if (!voucher) throw new Error("Voucher tidak ditemukan");

  const updateData = {};
  if (data.nama !== undefined) updateData.nama = data.nama;
  if (data.tipe_diskon !== undefined) updateData.tipe_diskon = data.tipe_diskon;
  if (data.nilai_diskon !== undefined) updateData.nilai_diskon = parseInt(data.nilai_diskon);
  if (data.min_pembelian !== undefined) updateData.min_pembelian = data.min_pembelian ? parseInt(data.min_pembelian) : null;
  if (data.max_diskon !== undefined) updateData.max_diskon = data.max_diskon ? parseInt(data.max_diskon) : null;
  if (data.kuota !== undefined) updateData.kuota = parseInt(data.kuota);
  if (data.tanggal_mulai !== undefined) updateData.tanggal_mulai = new Date(data.tanggal_mulai);
  if (data.tanggal_berakhir !== undefined) updateData.tanggal_berakhir = new Date(data.tanggal_berakhir);
  if (data.aktif !== undefined) updateData.aktif = data.aktif;

  return await prisma.voucher.update({
    where: { id },
    data: updateData,
  });
};

const deleteVoucher = async (id) => {
  const voucher = await prisma.voucher.findUnique({ where: { id } });
  if (!voucher) throw new Error("Voucher tidak ditemukan");

  return await prisma.voucher.delete({ where: { id } });
};

// Validasi voucher oleh customer saat checkout
const validateVoucher = async (kode, totalBelanja) => {
  const voucher = await prisma.voucher.findUnique({ where: { kode } });
  if (!voucher) throw new Error("Kode voucher tidak ditemukan");
  if (!voucher.aktif) throw new Error("Voucher tidak aktif");

  const now = new Date();
  if (now < voucher.tanggal_mulai || now > voucher.tanggal_berakhir) {
    throw new Error("Voucher expired");
  }
  if (voucher.kuota > 0 && voucher.terpakai >= voucher.kuota) {
    throw new Error("Kuota voucher sudah habis");
  }
  if (voucher.min_pembelian && totalBelanja < voucher.min_pembelian) {
    throw new Error(`Minimal pembelian Rp ${voucher.min_pembelian.toLocaleString("id-ID")}`);
  }

  let diskon = 0;
  if (voucher.tipe_diskon === "PERSENTASE") {
    diskon = Math.floor((totalBelanja * voucher.nilai_diskon) / 100);
    if (voucher.max_diskon && diskon > voucher.max_diskon) {
      diskon = voucher.max_diskon;
    }
  } else {
    diskon = voucher.nilai_diskon;
  }

  return { voucher, diskon };
};

module.exports = {
  createVoucher,
  getAllVouchers,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  validateVoucher,
};
