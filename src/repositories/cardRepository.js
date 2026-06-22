import { OwnershipStatus } from '@prisma/client';
import prisma from '../config/prisma.js';

const createCard = async (cardData) => {
  const { creatorId, totalQuantity, minimumPrice } = cardData;

  // 총 발행량만큼 소유권 배열 생성
  const initialOwnerships = Array.from({ length: totalQuantity }).map(() => ({
    ownerId: creatorId,
    purchasePrice: Number(minimumPrice),
    status: OwnershipStatus.IN_GALLERY,
  }));

  // Prisma 중첩 쓰기를 사용하여 트랜잭션 처리
  const newCard = await prisma.card.create({
    data: {
      ...cardData,
      ownerships: {
        create: initialOwnerships,
      },
    },
  });

  return newCard;
};

// 월별 포토 카드 생성 횟수 조회
const countCardsByMonth = async (userId, startDate, endDate) => {
  return await prisma.card.count({
    where: {
      creatorId: userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });
};

const cardRepository = {
  createCard,
  countCardsByMonth,
};

export default cardRepository;
