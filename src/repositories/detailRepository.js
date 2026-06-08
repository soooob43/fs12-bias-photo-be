import prisma from '../config/prisma.js';

const getMarketDetail = async (transactionId) => {
  return await prisma.transaction.findFirst({
    where: {
      id: Number(transactionId),
      isDeleted: false, // 삭제되지 않은 판매정보만 불러오기
    },
    include: {
      card: true,
      seller: true,
    },
  });
};

export default {
  getMarketDetail,
};
