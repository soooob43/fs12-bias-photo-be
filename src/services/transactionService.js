import { OwnershipStatus } from '@prisma/client';
import transactionRepository from '../repositories/transactionRepository.js';
import prisma from '../config/prisma.js';

/*---------------------------
  포토 카드 조회
  add : 2026.06.08 윤소정

  ---반환--- 
  [
  {
    cardId: 1,
    title: 'A 카드',
    quantity: 2,
    ownershipIds: [10, 11]
  },
  {
    cardId: 2,
    title: 'B 카드',
    quantity: 1,
    ownershipIds: [20]
  }
]
----------------------------*/
const getAvailableCards = async (userId) => {
  //소유권을 갖고 있는 카드 조회
  const ownerships =
    await transactionRepository.findAvailableCardOwnerships(userId);

  //cardId를 기준으로 묶음 = > 발행량만큼 카드를 만들기때문
  const cardsById = ownerships.reduce((acc, ownership) => {
    const cardId = ownership.card.id;
    const existingCard = acc.find((card) => card.cardId === cardId);

    if (existingCard) {
      existingCard.quantity += 1; //같은 카드가 있다면 +1
      existingCard.ownershipIds.push(ownership.id); //카드 소유권 Id 추가
    } else {
      //새로운 카드인 경우 생성
      acc.push({
        cardId,
        title: ownership.card.title,
        imageUrl: ownership.card.imageUrl,
        description: ownership.card.description,
        grade: ownership.card.grade,
        genre: ownership.card.genre,
        minimumPrice: ownership.card.minimumPrice,
        quantity: 1,
        ownershipIds: [ownership.id],
      });
    }
    return acc;
  }, []);
  return cardsById;
};

/*---------------------------
      포토 카드 판매 등록
----------------------------*/
const createTransaction = async (sellerId, transactionData) => {
  /*-------------------------
          검증 로직
  -------------------------*/
  const { ownershipIds, cardId } = transactionData;

  const uniqueOwnershipIds = ownershipIds.filter((id, idx) => {
    return ownershipIds.indexOf(id) === idx;
  });

  if (uniqueOwnershipIds.length !== ownershipIds.length) {
    const error = new Error('중복된 포토카드가 선택되었습니다.');
    error.statusCode = 400;
    throw error;
  }

  const ownerships = await prisma.cardOwnership.findMany({
    where: { id: { in: ownershipIds } },
  });

  if (ownerships.length !== ownershipIds.length) {
    throw new Error('일부 카드를 찾을 수 없습니다. 다시 확인해 주세요.');
  }
  for (const ownership of ownerships) {
    if (ownership.ownerId !== sellerId) {
      throw new Error('본인이 소유한 카드만 판매할 수 있습니다.');
    }
    if (ownership.status !== OwnershipStatus.IN_GALLERY) {
      throw new Error('현재 갤러리에 보유 중인 카드만 판매할 수 있습니다.');
    }
    if (ownership.cardId !== cardId) {
      throw new Error('선택한 카드 중에 다른 종류의 도안이 섞여 있습니다.');
    }
  }

  const createdData = await transactionRepository.saveTransaction({
    sellerId,
    ...transactionData,
  });

  return createdData;
};

/*---------------------------
  포토 카드 판매 내역 전체 조회
----------------------------*/
const getAllTransactionsList = async (cursor, limit, queryOptions) => {
  const parsedLimit = parseInt(limit, 10) || 10;
  const parsedCursor = cursor ? parseInt(cursor, 10) : undefined;

  const transactions = await transactionRepository.getTransactions(
    parsedCursor,
    parsedLimit,
    queryOptions,
  );

  let nextCursor = null;
  if (transactions.length === parsedLimit) {
    nextCursor = transactions[transactions.length - 1].id;
  }

  return {
    transactions,
    nextCursor,
  };
};

const transactionService = {
  createTransaction,
  getAllTransactionsList,
  getAvailableCards,
};

export default transactionService;
