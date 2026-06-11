const prisma = require("../../libs/prisma");

const createNotification = async (userId, title, message) => {
  return await prisma.notification.create({
    data: {
      userId,
      judul: title,
      pesan: message,
    },
  });
};

const getUserNotifications = async (userId) => {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50, // limit 50 terbaru
  });
};

const markAsRead = async (id, userId) => {
  return await prisma.notification.updateMany({
    where: { id, userId },
    data: { is_read: true },
  });
};

const markAllAsRead = async (userId) => {
  return await prisma.notification.updateMany({
    where: { userId, is_read: false },
    data: { is_read: true },
  });
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
