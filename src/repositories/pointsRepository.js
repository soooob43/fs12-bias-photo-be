import { PointHistoryType } from '@prisma/client';
import prisma from '../config/prisma.js';

const findRandomBoxByUserId = async (userId) => {
  return prisma.randomBox.findUnique({
    where: { userId },
  });
};

const pointsRepository = {
  findRandomBoxByUserId,
};

export default pointsRepository;
