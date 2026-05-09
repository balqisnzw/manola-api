const prisma = require("../../libs/prisma");

const EMPLOYEE_ROLES = ["ADMIN", "KASIR", "PACKAGING"];

const createEmployee = async (data) => {
  const { email, password, nama, foto, role } = data;

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
    },
    select: {
      id: true,
      email: true,
      nama: true,
      foto: true,
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
      role: true,
      createdAt: true,
    },
    orderBy: { id: "asc" },
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
  deleteEmployee,
};
