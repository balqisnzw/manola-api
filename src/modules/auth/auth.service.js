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

module.exports = {
  findUserByEmail,
  createUser,
};
