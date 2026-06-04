const prisma = require("../../libs/prisma");

const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

const createUser = async (data) => {
  return await prisma.user.create({
    data,
  });
};

const updateUserPassword = async (email, hashedPassword) => {
  return await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
};

// === Reset Password Token ===

const createResetToken = async (email, token, expiresAt) => {
  // Hapus token lama untuk email ini (jika ada)
  await prisma.resetPasswordToken.deleteMany({ where: { email } });

  return await prisma.resetPasswordToken.create({
    data: { email, token, expiresAt },
  });
};

const findResetToken = async (token) => {
  return await prisma.resetPasswordToken.findUnique({
    where: { token },
  });
};

const deleteResetToken = async (token) => {
  return await prisma.resetPasswordToken.delete({
    where: { token },
  });
};

const getAllUsers = async (role) => {
  const where = {};
  if (role) where.role = role;

  return await prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      nama: true,
      foto: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

module.exports = {
  findUserByEmail,
  createUser,
  updateUserPassword,
  createResetToken,
  findResetToken,
  deleteResetToken,
  getAllUsers,
};
