import prisma from '../config/prisma.js';

export const createNotification = async ({ userId, type, message }) => {
  return prisma.notification.create({
    data: {
      userId,
      type,
      message,
    },
  });
};

export const findNotifications = async ({ userId, cursor, limit }) => {
  return prisma.notification.findMany({
    where: {
      userId,
      isDeleted: false,
      ...(cursor && {
        id: {
          lt: cursor,
        },
      }),
    },
    select: {
      id: true,
      message: true,
      isRead: true,
      createdAt: true,
    },
    orderBy: {
      id: 'desc',
    },
    take: limit,
  });
};

export const countUnreadNotifications = async (userId) => {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
      isDeleted: false,
    },
  });
};

export const findNotificationById = async (notificationId) => {
  return prisma.notification.findUnique({
    where: {
      id: notificationId,
    },
    select: {
      id: true,
      userId: true,
      isRead: true,
    },
  });
};

export const markNotificationAsRead = async (notificationId) => {
  return prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
    },
  });
};

export const markNotificationsAsRead = async ({ notificationIds, userId }) => {
  return prisma.notification.updateMany({
    where: {
      id: {
        in: notificationIds,
      },
      userId,
      isDeleted: false,
    },
    data: {
      isRead: true,
    },
  });
};
