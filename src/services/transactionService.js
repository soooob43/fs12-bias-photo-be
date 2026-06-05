import { OwnershipStatus } from '@prisma/client';
import transactionRepository from '../repositories/transactionRepository.js';
import prisma from '../config/prisma.js';

/*---------------------------
      포토 카드 판매 등록
----------------------------*/
const createTransaction = async (sellerId, transactionData) => {
  /*-------------------------
          검증 로직
  -------------------------*/
  const { ownershipIds, cardId } = transactionData;
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
const getAllTransactionsList = async () => {
  const data = await transactionRepository.getTransactions();

  return data;
};

const transactionService = {
  createTransaction,
  getAllTransactionsList,
};

export default transactionService;
