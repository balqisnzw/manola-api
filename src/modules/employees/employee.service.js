const prisma = require("../../libs/prisma");

const EMPLOYEE_ROLES = ["ADMIN", "KASIR", "PACKAGING"];

const createEmployee = async (data) => {
  const { email, password, nama, foto, role, no_telepon } = data;

  if (!EMPLOYEE_ROLES.includes(role)) {
    throw new Error(`Role tidak valid. Harus salah satu dari: ${EMPLOYEE_ROLES.join(", ")}`);
  }

  // Cek email sudah terdaftar
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("Email sudah terdaftar");
  }

  return await prisma.user.create({
    data: {
      email,
      password,
      nama,
      foto: foto || null,
      role,
      no_telepon,
    },
    select: {
      id: true,
      email: true,
      nama: true,
      foto: true,
      no_telepon: true,
      role: true,
      createdAt: true,
    },
  });
};

const getAllEmployees = async () => {
  return await prisma.user.findMany({
    where: {
      role: { in: EMPLOYEE_ROLES },
    },
    select: {
      id: true,
      email: true,
      nama: true,
      foto: true,
      no_telepon: true,
      role: true,
      createdAt: true,
    },
    orderBy: { id: "asc" },
  });
};

const getEmployeeById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      nama: true,
      foto: true,
      no_telepon: true,
      role: true,
      createdAt: true,
    },
  });
};

const updateEmployee = async (id, data) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new Error("Karyawan tidak ditemukan");
  }

  if (!EMPLOYEE_ROLES.includes(user.role)) {
    throw new Error("User ini bukan karyawan dan tidak bisa diubah melalui endpoint ini");
  }

  const updateData = {};
  if (data.nama !== undefined) updateData.nama = data.nama;
  if (data.no_telepon !== undefined) updateData.no_telepon = data.no_telepon;
  if (data.role !== undefined) {
    if (!EMPLOYEE_ROLES.includes(data.role)) {
      throw new Error(`Role tidak valid. Harus salah satu dari: ${EMPLOYEE_ROLES.join(", ")}`);
    }
    updateData.role = data.role;
  }
  if (data.password) {
    updateData.password = data.password;
  }

  return await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      email: true,
      nama: true,
      foto: true,
      no_telepon: true,
      role: true,
      createdAt: true,
    },
  });
};

const deleteEmployee = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new Error("Karyawan tidak ditemukan");
  }

  if (!EMPLOYEE_ROLES.includes(user.role)) {
    throw new Error("User ini bukan karyawan dan tidak bisa dihapus melalui endpoint ini");
  }

  return await prisma.user.delete({
    where: { id },
    select: {
      id: true,
      email: true,
      nama: true,
      role: true,
    },
  });
};

module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
