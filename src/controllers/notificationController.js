import express from 'express';

import { verifyAccessToken } from '../middlewares/auth.js';

import {
  getNotifications,
  getUnreadCount,
  readNotification,
  readNotifications,
} from '../services/notificationService.js';

import {
  getNotificationsSchema,
  readNotificationSchema,
  readNotificationsSchema,
} from '../schemas/notificationSchema.js';

const notificationController = express.Router();

notificationController.get('/', verifyAccessToken, async (req, res, next) => {
  try {
    const { cursor, limit } = getNotificationsSchema.parse(req.query);

    const result = await getNotifications({
      userId: req.auth.userId,
      cursor,
      limit,
    });

    return res.status(200).json({
      message: '알림 조회 성공',
      data: result.data,
      nextCursor: result.nextCursor,
    });
  } catch (error) {
    next(error);
  }
});

notificationController.get(
  '/unread-count',
  verifyAccessToken,
  async (req, res, next) => {
    try {
      const result = await getUnreadCount(req.auth.userId);

      return res.status(200).json({
        message: '안읽은 알림 개수 조회 성공',
        unreadCount: result.unreadCount,
      });
    } catch (error) {
      next(error);
    }
  },
);

notificationController.patch(
  '/:id/read',
  verifyAccessToken,
  async (req, res, next) => {
    try {
      const { notificationId } = readNotificationSchema.parse({
        notificationId: req.params.id,
      });

      await readNotification({
        notificationId,
        userId: req.auth.userId,
      });

      return res.status(200).json({
        message: '알림 읽음 처리 성공',
      });
    } catch (error) {
      next(error);
    }
  },
);

notificationController.patch(
  '/read',
  verifyAccessToken,
  async (req, res, next) => {
    try {
      const { notificationIds } = readNotificationsSchema.parse(req.body);

      await readNotifications({
        notificationIds,
        userId: req.auth.userId,
      });

      return res.status(200).json({
        message: '알림 일괄 읽음 처리 성공',
      });
    } catch (error) {
      next(error);
    }
  },
);

export default notificationController;
