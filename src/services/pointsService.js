import { PointHistoryType } from '@prisma/client';
import prisma from '../config/prisma.js';
import pointsRepository from '../repositories/pointsRepository.js';
import AppError from '../utils/appError.js';

const ONE_HOUR = 60 * 60 * 1000;
const RANDOM_BOX_MIN_POINT = 10;
const RANDOM_BOX_MAX_POINT = 50;

const getRandomBoxStatus = async (userId) => {
  const randomBox = await pointsRepository.findRandomBoxByUserId(userId);

  //최초 사용자
  if (!randomBox) {
    return {
      nextAvailableAt: null,
    };
  }
  const nextAvailableAt = new Date(randomBox.lastOpenedAt.getTime() + ONE_HOUR);

  return {
    nextAvailableAt: nextAvailableAt > new Date() ? nextAvailableAt : null,
  };
};

const drawRandomPoint = async (userId) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - ONE_HOUR);
  const findRandomBox = await pointsRepository.findRandomBoxByUserId(userId);

  const drawPoint =
    Math.floor(
      Math.random() * (RANDOM_BOX_MAX_POINT - RANDOM_BOX_MIN_POINT + 1),
    ) + RANDOM_BOX_MIN_POINT;

  if (!findRandomBox) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.randomBox.create({
          data: {
            userId,
            earnedPoints: drawPoint,
          },
        });

        await tx.userPoint.update({
          where: { userId },
          data: {
            balance: {
              increment: drawPoint,
            },
          },
        });

        await tx.pointHistory.create({
          data: {
            userId,
            amount: drawPoint,
            type: PointHistoryType.RANDOM_BOX,
          },
        });
      });

      return {
        earnedPoints: drawPoint,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        throw AppError(409, 'RANDOM_BOX_CONFLICT', '이미 처리된 요청입니다.');
      }

      throw error;
    }
  }

  await prisma.$transaction(async (tx) => {
    const result = await tx.randomBox.updateMany({
      where: {
        userId,
        lastOpenedAt: {
          lte: oneHourAgo,
        },
      },
      data: {
        lastOpenedAt: now,
        earnedPoints: drawPoint,
      },
    });

    if (result.count === 0) {
      throw AppError(
        409,
        'RANDOM_BOX_COOLDOWN',
        '랜덤박스는 1시간마다 사용할 수 있습니다.',
      );
    }

    await tx.userPoint.update({
      where: { userId },
      data: {
        balance: {
          increment: drawPoint,
        },
      },
    });

    await tx.pointHistory.create({
      data: {
        userId,
        amount: drawPoint,
        type: PointHistoryType.RANDOM_BOX,
      },
    });
  });

  return {
    earnedPoints: drawPoint,
  };
};

const pointsService = { getRandomBoxStatus, drawRandomPoint };

export default pointsService;
