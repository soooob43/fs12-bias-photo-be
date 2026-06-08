import { findMySales } from '../repositories/mySaleRepository.js';

const getSaleStatus = (sale) => {
  if (sale.remainingQuantity === 0) {
    return "SOLD_OUT";
  }

  if (sale.exchangeOffers.length > 0) {
    return "ON_EXCHANGE";
  }

  return "ON_SALE";
};

export const getMySales = async ({
  sellerId,
  page,
  limit,
  status,
}) => {
  const skip = (page - 1) * limit;

  const sales = await findMySales({ sellerId,

  const sales = await findMySales({
    sellerId,
    skip,
    take: limit,
  });

  const salesData = sales.map((sale) => {
      const saleStatus = getSaleStatus(sale);

      return {
        transactionId: sale.id,
        title: sale.card.title,
        imageUrl: sale.card.imageUrl,
        grade: sale.card.grade,
        genre: sale.card.genre,
        creatorNickname: sale.card.creator.nickname,
        price: sale.price,
        remainingQuantity: sale.remainingQuantity,
        status: saleStatus,
      };
    })
    .filter((sale) => {
      if (!status) {
        return true;
      }

      return sale.status === status;
    });

  const totalCount = salesData.length;

  return {
    data: salesData,

    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};