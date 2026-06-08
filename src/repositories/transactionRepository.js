import { CardGenre, CardGrade, OwnershipStatus } from '@prisma/client';
import prisma from '../config/prisma.js';

/*---------------------------
판매 또는 교환 중이 아닌 카드 조회 ( + 로그인 기준 )
  add : 2026.06.08 윤소정
----------------------------*/
const findAvailableCardOwnerships = async (ownerId) => {
  //CardOwnership 조회 => 각각 카드의 소유권 ID가 판매 등록 POST에서 필요해서 
  return prisma.cardOwnership.findMany({
    where: {
      ownerId,
      status: OwnershipStatus.IN_GALLERY,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      card: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
          description: true,
          grade: true,
          genre: true,
          minimumPrice: true,
        },
      },
    },
  });
};

const saveTransaction = async (data) => {
  return await prisma.$transaction(async (tx) => {
    const newTransaction = await tx.transaction.create({
      data: {
        sellerId: data.sellerId,
        cardId: data.cardId,
        price: data.price,
        totalQuantity: data.ownershipIds.length,
        remainingQuantity: data.ownershipIds.length,
        exchangeGrade: data.exchangeGrade,
        exchangeGenre: data.exchangeGenre,
        exchangeDescription: data.exchangeDescription,
      },
    });

    await tx.cardOwnership.updateMany({
      where: {
        id: { in: data.ownershipIds },
      },
      data: {
        status: OwnershipStatus.ON_SALE,
        transactionId: newTransaction.id,
      },
    });

    return newTransaction;
  });
};

const getTransactions = async (cursor, limit, queryOptions) => {
  const { keyword, filterType, filterValue, sortBy, sortOrder } = queryOptions;

  const where = { isDeleted: false };

  // 카드 제목, 카드 설명, 판매자 닉네임, 교환 카드 설명에 포함된 키워드로 검색
  if (keyword) {
    where.OR = [
      { card: { title: { contains: keyword, mode: 'insensitive' } } },
      { card: { description: { contains: keyword, mode: 'insensitive' } } },
      { seller: { nickname: { contains: keyword, mode: 'insensitive' } } },
      { exchangeDescription: { contains: keyword, mode: 'insensitive' } },
    ];
  }

  if (filterType && filterValue) {
    switch (filterType) {
      case 'GRADE': // 카드 등급 필터
        where.card = { ...where.card, grade: filterValue };
        break;
      case 'GENRE': // 카드 장르 필터
        where.card = { ...where.card, genre: filterValue };
        break;
      case 'SALE_STATUS': // 매진 여부 필터
        if (filterValue === 'SOLD_OUT') {
          where.remainingQuantity = 0;
        } else if (filterValue === 'ON_SALE') {
          where.remainingQuantity = { gt: 0 }; // 0보다 크면 판매 중
        }
        break;
    }
  }

  const orderBy = [];
  const orderDirection = sortOrder === 'ASC' ? 'asc' : 'desc';

  if (sortBy === 'PRICE') {
    orderBy.push({ price: orderDirection });
  } else {
    // sortBy가 없거나 DATE일 경우 최신순/오래된순
    orderBy.push({ createdAt: orderDirection });
  }

  // 동일한 가격이나 같은 시간에 등록된 데이터가 있을 경우를 대비한 2차 정렬 기준
  orderBy.push({ id: 'desc' });

  const query = {
    take: limit,
    where,
    orderBy,
    include: {
      card: true,
      seller: {
        select: {
          id: true,
          nickname: true,
        },
      },
    },
  };

  if (cursor) {
    query.cursor = { id: cursor };
    query.skip = 1;
  }

  return await prisma.transaction.findMany(query);
};

const transactionRepository = {
  saveTransaction,
  getTransactions,
  findAvailableCardOwnerships,
};

export default transactionRepository;
