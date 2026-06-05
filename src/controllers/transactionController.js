import express from 'express';
import transactionService from '../services/transactionService.js';
import validate from '../middlewares/validate.js';
import { transactionSchema } from '../schemas/transaction.schema.js';
import { verifyAccessToken } from '../middlewares/auth.js';

const transactionController = express.Router();

/*---------------------------
      포토 카드 판매 등록
----------------------------*/
transactionController.post(
  '/',
  verifyAccessToken,
  validate(transactionSchema),
  async (req, res, next) => {
    try {
      const transactionData = req.body;
      const sellerId = req.auth.userId;

      const newTransaction = await transactionService.createTransaction(
        sellerId,
        transactionData,
      );
      return res.status(201).json({
        message: '포토 카드 판매 등록이 완료되었습니다.',
        data: newTransaction,
      });
    } catch (error) {
      next(error);
    }
  },
);

/*------------------------------------
      포토 카드 판매 내역 전체 조회
-------------------------------------*/
transactionController.get('/', async (req, res, next) => {
  try {
    const transactions = await transactionService.getAllTransactionsList();
    return res.status(200).json({
      message: '포토 카드 판매 조회가 완료되었습니다.',
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
});

export default transactionController;
