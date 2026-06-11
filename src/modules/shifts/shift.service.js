const prisma = require("../../libs/prisma");

const startShift = async (kasirId, modal_awal) => {
  const active = await prisma.cashierShift.findFirst({
    where: { kasirId, selesai: null },
  });
  if (active) {
    throw new Error("Shift kasir sudah aktif");
  }
  return await prisma.cashierShift.create({
    data: {
      kasirId,
      modal_awal: parseInt(modal_awal),
    },
  });
};

const getActiveShift = async (kasirId) => {
  return await prisma.cashierShift.findFirst({
    where: { kasirId, selesai: null },
    include: {
      expenses: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
};

const closeShift = async (id, modal_akhir, catatan) => {
  const shift = await prisma.cashierShift.findUnique({
    where: { id },
  });
  if (!shift) {
    throw new Error("Shift tidak ditemukan");
  }
  return await prisma.cashierShift.update({
    where: { id },
    data: {
      modal_akhir: parseInt(modal_akhir),
      catatan: catatan || null,
      selesai: new Date(),
    },
  });
};

const addPettyCash = async (shiftId, jumlah, keterangan) => {
  const shift = await prisma.cashierShift.findUnique({
    where: { id: shiftId },
  });
  if (!shift) {
    throw new Error("Shift tidak ditemukan");
  }
  await prisma.cashierShift.update({
    where: { id: shiftId },
    data: {
      pengeluaran: { increment: parseInt(jumlah) },
    },
  });
  return await prisma.pettyCash.create({
    data: {
      shiftId,
      jumlah: parseInt(jumlah),
      keterangan,
    },
  });
};

const getAllShifts = async () => {
  return await prisma.cashierShift.findMany({
    include: {
      kasir: {
        select: { id: true, nama: true },
      },
      expenses: true,
    },
    orderBy: { mulai: "desc" },
  });
};

module.exports = {
  startShift,
  getActiveShift,
  closeShift,
  addPettyCash,
  getAllShifts,
};
