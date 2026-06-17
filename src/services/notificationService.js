import { NotificationType } from '@prisma/client';
import AppError from '../utils/appError.js';
import { sendSseNotification } from '../utils/sseManager.js';

import {
  findNotifications,
  countUnreadNotifications,
  findNotificationById,
  markNotificationAsRead,
  markNotificationsAsRead,
  createNotification as createNotificationRepository,
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
    throw AppError(404, 'NOTIFICATION_NOT_FOUND', '존재하지 않는 알림입니다.');
  }

  if (notification.userId !== userId) {
    throw AppError(
      403,
      'NOTIFICATION_FORBIDDEN',
      '본인 알림만 읽을 수 있습니다.',
    );
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

export const createNotification = async ({
  userId,
  type,
  message,
}) => {
  const notification = await createNotificationRepository({
    userId,
    type,
    message,
  });

  sendSseNotification(userId, notification);

  return notification;
};

export const createPurchaseNotification = async ({
  sellerId,
  buyerNickname,
  cardGrade,
  cardTitle,
  quantity,
}) => {
  const message = `${buyerNickname}님이 [${cardGrade} | ${cardTitle}]을(를) ${quantity}장 구매했습니다.`;

  return createNotification({
    userId: sellerId,
    type: NotificationType.PURCHASE_COMPLETED,
    message,
  });
};

export const createTradeOfferNotification = async ({
  sellerId,
  proposerNickname,
  cardGrade,
  cardTitle,
}) => {
  const message = `${proposerNickname}님이 [${cardGrade} | ${cardTitle}]의 포토카드 교환을 제안했습니다.`;

  return createNotification({
    userId: sellerId,
    type: NotificationType.EXCHANGE_OFFER,
    message,
  });
};

export const createTradeAcceptedNotification = async ({
  proposerId,
  sellerNickname,
  cardGrade,
  cardTitle,
}) => {
  const message = `${sellerNickname}님과의 [${cardGrade} | ${cardTitle}] 포토카드 교환이 성사되었습니다.`;

  return createNotification({
    userId: proposerId,
    type: NotificationType.EXCHANGE_ACCEPTED,
    message,
  });
};

export const createTradeRejectedNotification = async ({
  proposerId,
  sellerNickname,
  cardGrade,
  cardTitle,
}) => {
  const message = `${sellerNickname}님과의 [${cardGrade} | ${cardTitle}] 포토카드 교환이 무산되었습니다.`;

  return createNotification({
    userId: proposerId,
    type: NotificationType.EXCHANGE_REJECTED,
    message,
  });
};

export const createSoldOutNotification = async ({
  sellerId,
  cardGrade,
  cardTitle,
}) => {
  const message = `[${cardGrade} | ${cardTitle}] 이(가) 품절되었습니다.`;

  return createNotification({
    userId: sellerId,
    type: NotificationType.SOLD_OUT,
    message,
  });
};
