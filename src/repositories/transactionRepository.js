import { CardGenre, CardGrade, OwnershipStatus } from '@prisma/client';
import prisma from '../config/prisma.js';

/*---------------------------
판매 또는 교환 중이 아닌 카드 조회 ( + 로그인 기준 )
  add : 2026.06.08 윤소정
  fix : 2026.06.10 검색 정렬 추가
----------------------------*/
const findAvailableCardOwnerships = async (
  ownerId,
  { keyword, grade, genre } = {},
) => {
  const cardWhere = {};

  if (keyword) {
    cardWhere.OR = [
      {
        title: {
          contains: keyword,
          mode: 'insensitive',
        },
      },
      {
        description: {
          contains: keyword,
          mode: 'insensitive',
        },
      },
    ];
  }

  if (grade) {
    cardWhere.grade = grade;
  }

  if (genre) {
    cardWhere.genre = genre;
  }

  //CardOwnership 조회 => 각각 카드의 소유권 ID가 판매 등록 POST에서 필요해서
  return prisma.cardOwnership.findMany({
    where: {
      ownerId,
      status: OwnershipStatus.IN_GALLERY,
      ...(Object.keys(cardWhere).length > 0 && {
        card: cardWhere,
      }),
    },
    orderBy: {
      updatedAt: 'desc',
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

/*--------------------------------
     판매 포토 카드 등록 - 최혜성
----------------------------------*/
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

/*----------------------------------------
     판매 포토 카드 전체 내역 조회 - 최혜성
------------------------------------------*/
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

const findOwnershipsByIds = async (ownershipIds) => {
  return await prisma.cardOwnership.findMany({
    where: {
      id: { in: ownershipIds },
    },
  });
};

/*--------------------------------
  판매 포토 카드 장르별 개수 - 최혜성
----------------------------------*/
const countTransactionsByGenre = async (genre) => {
  return await prisma.transaction.count({
    where: { card: { genre } },
  });
};

/*--------------------------------
  판매 포토 카드 등급별 개수 - 최혜성
----------------------------------*/
const countTransactionsByGrade = async (grade) => {
  return await prisma.transaction.count({
    where: { card: { grade } },
  });
};

/*--------------------------------------
  판매 포토 카드 판매 여부별 개수 - 최혜성
---------------------------------------*/
const countTransactionsBySaleStatus = async (status) => {
  const condition = status === 'SOLD_OUT' ? 0 : { gt: 0 };
  return await prisma.transaction.count({
    where: {
      remainingQuantity: condition,
    },
  });
};

/*---------------------------
  수정하기 모달 
  add : 2026.06.16 윤소정
----------------------------*/
const findTransactionById = async (transactionId) => {
  return await prisma.transaction.findUnique({
    where: { id: Number(transactionId) },
    include: {
      ownerships: {
        where: {
          status: OwnershipStatus.ON_SALE,
        },
        orderBy: {
          id: 'desc',
        },
      },
    },
  });
};

const updateTransaction = async (transactionId, data) => {
  const updateData = {
    price: data.price,
    totalQuantity: data.totalQuantity,
    remainingQuantity: data.remainingQuantity,
    exchangeGrade: data.exchangeGrade,
    exchangeGenre: data.exchangeGenre,
    exchangeDescription: data.exchangeDescription,
  };

  Object.keys(updateData).forEach((key) => {
    if (updateData[key] === undefined) {
      delete updateData[key];
    }
  });

  return await prisma.transaction.update({
    where: { id: Number(transactionId) },
    data: updateData,
  });
};

const releaseSaleOwnerships = async (ownershipIds) => {
  return await prisma.cardOwnership.updateMany({
    where: {
      id: { in: ownershipIds },
    },
    data: {
      status: OwnershipStatus.IN_GALLERY,
      transactionId: null,
    },
  });
};
/*--------------------------------------
  판매 포토 카드 내역 전체 개수 - 최혜성
---------------------------------------*/
const countAllTransactions = async () => {
  return await prisma.transaction.count();
};

const transactionRepository = {
  saveTransaction,
  getTransactions,
  findAvailableCardOwnerships,
  findOwnershipsByIds,
  countTransactionsByGenre,
  countTransactionsByGrade,
  countTransactionsBySaleStatus,
  countAllTransactions,
  findTransactionById,
  updateTransaction,
  releaseSaleOwnerships,
};

export default transactionRepository;
