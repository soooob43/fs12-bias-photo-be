import { findMySales, countMySales } from '../repositories/mySaleRepository.js';

const getSaleStatus = (sale) => {
  if (sale.remainingQuantity === 0) {
    return 'SOLD_OUT';
  }

  if (sale.exchangeOffers.length > 0) {
    return 'ON_EXCHANGE';
  }

  return 'ON_SALE';
};

export const getMySales = async ({
  sellerId,
  page,
  limit,
  grade,
  genre,
  saleMethod,
  soldOut,
  keyword,
}) => {
  const skip = (page - 1) * limit;

  const where = { sellerId, isDeleted: false };

  if (grade) {
    where.card = { is: { grade } };
  }
  if (genre) {
    where.card = { is: { ...where.card?.is, genre } };
  }

  if (soldOut === 'true') {
    where.remainingQuantity = 0;
  }
  if (soldOut === 'false') {
    where.remainingQuantity = { gt: 0 };
  }

  if (saleMethod === 'SALE') {
    where.exchangeDescription = null;
  }
  if (saleMethod === 'EXCHANGE') {
    where.exchangeDescription = { not: null };
  }

  if (keyword) {
    where.OR = [
      { card: { is: { title: { contains: keyword, mode: 'insensitive' } } } },
      {
        card: {
          is: { description: { contains: keyword, mode: 'insensitive' } },
        },
      },
    ];
  }

  const allSales = await findMySales({ where });

  const sales = await findMySales({ where, skip, take: limit });

  const mappedSales = sales.map((sale) => {
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
  });

  const gradeCounts = allSales.reduce(
    (acc, sale) => {
      acc[sale.card.grade]++;
      return acc;
    },
    { COMMON: 0, RARE: 0, SUPER_RARE: 0, LEGENDARY: 0 },
  );

  const totalCount = await countMySales(where);

  return {
    data: mappedSales,
    gradeCounts,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
};
