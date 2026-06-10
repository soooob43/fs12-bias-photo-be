import {
  findNotifications,
  countUnreadNotifications,
  findNotificationById,
  markNotificationAsRead,
  markNotificationsAsRead,
} from '../repositories/notificationRepository.js';

export const getNotifications = async ({ userId, cursor, limit }) => {
  const notifications = await findNotifications({
    userId,
    cursor,
    limit,
  });

  const nextCursor =
    notifications.length === limit
      ? notifications[notifications.length - 1].id
      : null;

  return {
    data: notifications,
    nextCursor,
  };
};

export const getUnreadCount = async (userId) => {
  const unreadCount = await countUnreadNotifications(userId);

  return {
    unreadCount,
  };
};

export const readNotification = async ({ notificationId, userId }) => {
  const notification = await findNotificationById(notificationId);

  if (!notification) {
    throw new Error('존재하지 않는 알림입니다.');
  }

  if (notification.userId !== userId) {
    throw new Error('본인 알림만 읽을 수 있습니다.');
  }

  if (notification.isRead) {
    return;
  }

  await markNotificationAsRead(notificationId);
};

export const readNotifications = async ({ notificationIds, userId }) => {
  await markNotificationsAsRead({
    notificationIds,
    userId,
  });
};
