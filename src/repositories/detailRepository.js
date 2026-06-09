import prisma from '../config/prisma.js';

const getMarketDetail = async (transactionId) => {
  return await prisma.transaction.findUnique({
    where: {
      id: Number(transactionId),
      isDeleted: false, // 삭제되지 않은 판매정보만 불러오기
    },
    select: {
      // transaction 필요 정보
      id: true,
      sellerId: true,
      price: true,
      totalQuantity: true,
      remainingQuantity: true,
      exchangeGrade: true,
      exchangeGenre: true,
      exchangeDescription: true,
      createdAt: true,
      updatedAt: true,
      isDeleted: true,

      // card 테이블 정보 모두
      card: true,

      // seller id, nickname 만
      seller: {
        select: {
          id: true,
          nickname: true,
        },
      },
    },
  });
};

export default {
  getMarketDetail,
};
