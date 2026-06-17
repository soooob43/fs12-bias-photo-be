import { PointHistoryType } from '@prisma/client';
import prisma from '../config/prisma.js';

const findLatestRandomBoxByUserId = async (userId) => {
  return await prisma.randomBox.findFirst({
    where: { userId },
    orderBy: { lastOpenedAt: 'desc' },
  });
};

const drawRandomBox = async (userId, earnedPoints) => {
  return prisma.$transaction(async (tx) => {
    await tx.userPoint.update({
      where: { userId },
      data: { balance: { increment: earnedPoints } },
    });
    await tx.pointHistory.create({
      data: { userId, amount: earnedPoints, type: PointHistoryType.RANDOM_BOX },
    });
    const randomBox = await tx.randomBox.create({
      data: { userId, earnedPoints },
    });

    return randomBox;
  });
};

const pointsRepository = {
  findLatestRandomBoxByUserId,
  drawRandomBox,
};

export default pointsRepository;
