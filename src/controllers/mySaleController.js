import express from 'express';
import { getMySales } from '../services/mySaleService.js';
import { verifyAccessToken } from '../middlewares/auth.js';

const mySaleController = express.Router();

mySaleController.get('/', verifyAccessToken, async (req, res) => {
  try {
    const sellerId = req.auth.userId;
    console.log(req.auth);

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 15));

    const { grade, genre, saleMethod, soldOut, keyword } = req.query;

    const result = await getMySales({
      sellerId,
      page,
      limit,
      grade,
      genre,
      saleMethod,
      soldOut,
      keyword,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: '나의 판매 포토카드 조회 실패',
    });
  }
});

export default mySaleController;
