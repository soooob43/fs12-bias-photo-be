import { z } from 'zod';

export const getNotificationsSchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export const readNotificationSchema = z.object({
  notificationId: z.coerce.number().int().positive(),
});

export const readNotificationsSchema = z.object({
  notificationIds: z
    .array(z.number().int().positive())
    .min(1, '알림 ID는 최소 1개 이상 필요합니다.'),
});
