const prisma = require("../../libs/prisma");

const createBanner = async (data) => {
  return await prisma.banner.create({
    data: {
      judul: data.judul,
      gambar: data.gambar,
      link: data.link || null,
      urutan: data.urutan ? parseInt(data.urutan) : 0,
      aktif: data.aktif !== undefined ? (data.aktif === "true" || data.aktif === true) : true,
    },
  });
};

const getAllBanners = async (onlyActive = false) => {
  const where = onlyActive ? { aktif: true } : {};
  return await prisma.banner.findMany({
    where,
    orderBy: { urutan: "asc" },
  });
};

const updateBanner = async (id, data) => {
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) throw new Error("Banner tidak ditemukan");

  const updateData = {};
  if (data.judul !== undefined) updateData.judul = data.judul;
  if (data.gambar !== undefined) updateData.gambar = data.gambar;
  if (data.link !== undefined) updateData.link = data.link;
  if (data.urutan !== undefined) updateData.urutan = parseInt(data.urutan);
  if (data.aktif !== undefined) {
    updateData.aktif = data.aktif === "true" || data.aktif === true;
  }

  return await prisma.banner.update({ where: { id }, data: updateData });
};

const deleteBanner = async (id) => {
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) throw new Error("Banner tidak ditemukan");
  return await prisma.banner.delete({ where: { id } });
};

module.exports = { createBanner, getAllBanners, updateBanner, deleteBanner };
