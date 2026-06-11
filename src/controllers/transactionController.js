import express from 'express';
import transactionService from '../services/transactionService.js';
import validate from '../middlewares/validate.js';
import { transactionSchema } from '../schemas/transaction.schema.js';
import { verifyAccessToken } from '../middlewares/auth.js';

const transactionController = express.Router();

/*---------------------------
포토 카드 판매하기 / 교환하기 GET
  add : 2026.06.08 윤소정
  fix : 2026.06.10 검색 및 정렬 추가
----------------------------*/
transactionController.get(
  '/available-cards',
  verifyAccessToken,
  async (req, res, next) => {
    try {
      const { keyword, grade, genre } = req.query;

      const cards = await transactionService.getAvailableCards(
        req.auth.userId,
        {
          keyword,
          grade,
          genre,
        },
      );

      return res.status(200).json({
        message: '판매 가능한 포토카드 조회 성공',
        data: cards,
      });
    } catch (error) {
      next(error);
    }
  },
);

/*---------------------------
  포토 카드 판매 등록 - 최혜성
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
  포토 카드 판매 내역 전체 조회 - 최혜성
-------------------------------------*/
transactionController.get('/', async (req, res, next) => {
  try {
    const {
      cursor,
      limit,
      keyword,
      filterType, // 'GRADE', 'GENRE', 'SALE_STATUS'
      filterValue, // 'SUPER_RARE', 'SOLD_OUT', etc..
      sortBy, // 'PRICE', 'DATE'
      sortOrder, // 'ASC', 'DESC'
    } = req.query;

    const queryOptions = {
      keyword,
      filterType,
      filterValue,
      sortBy,
      sortOrder,
    };

    const result = await transactionService.getAllTransactionsList(
      cursor,
      limit,
      queryOptions,
    );
    return res.status(200).json({
      message: '포토 카드 판매 조회가 완료되었습니다.',
      data: result.transactions,
      nextCursor: result.nextCursor,
    });
  } catch (error) {
    next(error);
  }
});

/*------------------------------------------
  판매 포토 카드 필터 메타데이터 조회 - 최혜성
-------------------------------------------*/
transactionController.get('/meta', async (req, res, next) => {
  try {
    const metadata = await transactionService.getTransactionFiltersMeta();
    return res.status(200).json({
      message: '마켓 필터 메타데이터 조회가 완료되었습니다.',
      data: metadata,
    });
  } catch (error) {
    next(error);
  }
});

export default transactionController;
