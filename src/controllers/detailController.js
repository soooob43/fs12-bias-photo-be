import express from 'express';
import detailService from '../services/detailService.js';
import { verifyAccessToken } from '../middlewares/auth.js';
import AppError from '../utils/appError.js';

const router = express.Router();

router.get('/:transactionId', async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId || isNaN(Number(transactionId))) {
      throw AppError(400, 'INVALID_TRANSACTION_ID', '유효하지 않은 ID입니다.');
    }

    const data = await detailService.getPhotocard(transactionId);

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

router.post(
  '/:transactionId/purchase',
  verifyAccessToken,
  async (req, res, next) => {
    try {
      const { transactionId } = req.params;
      const { buyerId, quantity } = req.body;

      const result = await detailService.purchasePhotocard({
        transactionId,
        buyerId,
        quantity,
      });

      return res.status(200).json({
        message: '성공적으로 구매가 완료되었습니다.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

//교환 신청
router.post('/:transactionId/exchange', async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const { proposerId, offeredCardId, description } = req.body;

    const result = await detailService.createExchangeOffer({
      transactionId,
      proposerId,
      offeredCardId,
      description,
    });

    return res.status(201).json({
      message: '교환 제안이 성공적으로 등록되었습니다.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

//교환 제안 목록 조회
router.get('/:transactionId/exchange', async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const data = await detailService.getExchangeOffer(transactionId);
    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

//교환제안 내리기 (실제 DB 작업은 update지만 delete로 표현)
router.delete(
  '/exchange/:exchangeOfferId',
  verifyAccessToken,
  async (req, res, next) => {
    try {
      const { exchangeOfferId } = req.params;
      await detailService.deleteExchange(exchangeOfferId);
      return res.status(200).json({
        message: '해당 교환 제안이 성공적으로 취소/거절되었습니다.',
      });
    } catch (error) {
      next(error);
    }
  },
);

//판매글 내리기 (실제 DB 작업은 update지만 delete로 표현)
router.delete('/:transactionId', verifyAccessToken, async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    await detailService.deleteCardTransaction(transactionId);
    return res.status(200).json({
      message: '해당 판매 게시글이 성공적으로 내려갔습니다.',
    });
  } catch (error) {
    next(error);
  }
});

//교환 요청 수락하기
router.patch(
  '/:transactionId/exchange',
  verifyAccessToken,
  async (req, res, next) => {
    try {
      const { exchangeOfferId } = req.body;
      const loginId = req.auth.userId;

      const result = await detailService.acceptExchangeOffer({
        exchangeOfferId,
        loginId,
      });

      return res.status(200).json({
        message: '해당 교환 요청이 성공적으로 수락되었습니다.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
