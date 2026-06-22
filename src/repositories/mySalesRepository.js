import prisma from '../config/prisma.js';

// transaction 테이블에서 검색, 필터링에 맞는 where 함수
const buildTransactionWhere = (
  sellerId,
  { grade, genre, soldOut, keyword },
) => {
  const where = { sellerId, isDeleted: false };
  if (grade || genre) {
    where.card = {};
    if (grade) where.card.grade = grade;
    if (genre) where.card.genre = genre;
  }

  if (soldOut === 'true') where.remainingQuantity = 0;
  else if (soldOut === 'false') where.remainingQuantity = { gt: 0 };

  if (keyword) {
    where.OR = [
      { card: { title: { contains: keyword, mode: 'insensitive' } } },
      { card: { description: { contains: keyword, mode: 'insensitive' } } },
    ];
  }
  return where;
};

// exchange_offers 테이블에서 검색, 필터링에 맞는 where 함수
const buildExchangeWhere = (proposerId, { grade, genre, soldOut, keyword }) => {
  const where = { proposerId };
  const andConditions = [];

  if (soldOut === 'true') {
    where.isDeleted = true;
    where.offeredCard = { ownerId: { not: proposerId } };
  } else if (soldOut === 'false') {
    where.isDeleted = false;
  } else {
    andConditions.push({
      OR: [
        { isDeleted: false },
        { isDeleted: true, offeredCard: { ownerId: { not: proposerId } } },
      ],
    });
  }

  if (grade || genre) {
    where.offeredCard = { ...where.offeredCard, card: {} };
    if (grade) where.offeredCard.card.grade = grade;
    if (genre) where.offeredCard.card.genre = genre;
  }

  if (keyword) {
    andConditions.push({
      OR: [
        {
          offeredCard: {
            card: { title: { contains: keyword, mode: 'insensitive' } },
          },
        },
        {
          offeredCard: {
            card: { description: { contains: keyword, mode: 'insensitive' } },
          },
        },
      ],
    });
  }

  if (andConditions.length > 0) where.AND = andConditions;
  return where;
};

// 판매 / 교환 제시중인 포토 카드 등급별 갯수 조회
const getMyCardGradeCounts = async (ownerId) => {
  const grades = ['COMMON', 'RARE', 'SUPER_RARE', 'LEGENDARY'];

  const counts = await Promise.all(
    grades.map((grade) =>
      prisma.cardOwnership.count({
        where: { ownerId, status: { not: 'IN_GALLERY' }, card: { grade } },
      }),
    ),
  );

  return {
    COMMON: counts[0],
    RARE: counts[1],
    SUPER_RARE: counts[2],
    LEGENDARY: counts[3],
  };
};

// 유저가 판매중인 transaction id 조회
const findMySaleIds = async (sellerId, params) => {
  const where = buildTransactionWhere(sellerId, params);
  return prisma.transaction.findMany({
    where,
    select: { id: true, createdAt: true },
  });
};

// 유저가 교환 제시중인 exchangeOffer id 조회
const findMyExchangeOfferIds = async (sellerId, params) => {
  const where = buildExchangeWhere(sellerId, params);
  return prisma.exchangeOffer.findMany({
    where,
    select: { id: true, createdAt: true },
  });
};

// 유저가 판매중인 포토카드 조회
const findMySales = async (ids) => {
  return prisma.transaction.findMany({
    where: { id: { in: ids } },
    include: {
      card: {
        include: {
          creator: { select: { nickname: true } },
        },
      },
    },
  });
};

// 유저가 교환 제시중인 포토카드 조회
const findMyExchangeOffers = async (ids) => {
  return prisma.exchangeOffer.findMany({
    where: { id: { in: ids } },
    include: {
      offeredCard: {
        include: {
          card: {
            include: {
              creator: { select: { nickname: true } },
            },
          },
        },
      },
    },
  });
};

const mySalesRepository = {
  findMySales,
  findMyExchangeOffers,
  getMyCardGradeCounts,
  findMySaleIds,
  findMyExchangeOfferIds,
};

export default mySalesRepository;
