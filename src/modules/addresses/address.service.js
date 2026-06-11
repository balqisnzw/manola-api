const prisma = require("../../libs/prisma");

/**
 * Ambil semua alamat milik user tertentu
 */
const getByUser = async (userId) => {
  return await prisma.address.findMany({
    where: { userId },
    orderBy: [{ is_utama: "desc" }, { createdAt: "desc" }],
  });
};

/**
 * Ambil satu alamat berdasarkan ID (pastikan milik user)
 */
const getById = async (id, userId) => {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId) {
    throw new Error("Alamat tidak ditemukan");
  }
  return address;
};

/**
 * Buat alamat baru
 * Jika is_utama = true, nonaktifkan alamat utama lainnya
 */
const create = async (userId, data) => {
  const { 
    label, penerima, no_telepon, alamat, kota, kode_pos, is_utama,
    provinceId, cityId, districtId, provinsi, kecamatan 
  } = data;

  if (is_utama) {
    await prisma.address.updateMany({
      where: { userId, is_utama: true },
      data: { is_utama: false },
    });
  }

  return await prisma.address.create({
    data: {
      userId,
      label: label || "Rumah",
      penerima,
      no_telepon,
      alamat,
      kota,
      kode_pos,
      provinceId: provinceId ? parseInt(provinceId) : null,
      cityId: cityId ? parseInt(cityId) : null,
      districtId: districtId ? parseInt(districtId) : null,
      provinsi: provinsi || null,
      kecamatan: kecamatan || null,
      is_utama: is_utama || false,
    },
  });
};

/**
 * Update alamat
 */
const update = async (id, userId, data) => {
  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new Error("Alamat tidak ditemukan");
  }

  if (data.is_utama) {
    await prisma.address.updateMany({
      where: { userId, is_utama: true, id: { not: id } },
      data: { is_utama: false },
    });
  }

  const {
    label, penerima, no_telepon, alamat, kota, kode_pos, is_utama,
    provinceId, cityId, districtId, provinsi, kecamatan
  } = data;

  const updateData = {};
  if (label !== undefined) updateData.label = label;
  if (penerima !== undefined) updateData.penerima = penerima;
  if (no_telepon !== undefined) updateData.no_telepon = no_telepon;
  if (alamat !== undefined) updateData.alamat = alamat;
  if (kota !== undefined) updateData.kota = kota;
  if (kode_pos !== undefined) updateData.kode_pos = kode_pos;
  if (is_utama !== undefined) updateData.is_utama = is_utama;
  if (provinceId !== undefined) updateData.provinceId = provinceId ? parseInt(provinceId) : null;
  if (cityId !== undefined) updateData.cityId = cityId ? parseInt(cityId) : null;
  if (districtId !== undefined) updateData.districtId = districtId ? parseInt(districtId) : null;
  if (provinsi !== undefined) updateData.provinsi = provinsi;
  if (kecamatan !== undefined) updateData.kecamatan = kecamatan;

  return await prisma.address.update({
    where: { id },
    data: updateData,
  });
};

/**
 * Set alamat sebagai utama
 */
const setUtama = async (id, userId) => {
  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new Error("Alamat tidak ditemukan");
  }

  // Nonaktifkan semua alamat utama lainnya
  await prisma.address.updateMany({
    where: { userId, is_utama: true },
    data: { is_utama: false },
  });

  return await prisma.address.update({
    where: { id },
    data: { is_utama: true },
  });
};

/**
 * Hapus alamat
 */
const remove = async (id, userId) => {
  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new Error("Alamat tidak ditemukan");
  }

  return await prisma.address.delete({ where: { id } });
};

module.exports = {
  getByUser,
  getById,
  create,
  update,
  setUtama,
  remove,
};
