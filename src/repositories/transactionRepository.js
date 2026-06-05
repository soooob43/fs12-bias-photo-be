import { CardGenre, CardGrade, OwnershipStatus } from '@prisma/client';
import prisma from '../config/prisma.js';

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

const getTransactions = async () => {
  return await prisma.transaction.findMany();
};

const transactionRepository = {
  saveTransaction,
  getTransactions,
};

export default transactionRepository;
