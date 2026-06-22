import express from 'express';
// import { getMySales } from '../services/mySaleService.js';
import { verifyAccessToken } from '../middlewares/auth.js';
import mySalesService from '../services/mySalesService.js';

const mySaleController = express.Router();

mySaleController.get('/', verifyAccessToken, async (req, res, next) => {
  try {
    const sellerId = req.auth.userId;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 15));

    const { grade, genre, saleMethod, soldOut, keyword } = req.query;

    const result = await mySalesService.getMySales({
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
    next(error);
  }
});

export default mySaleController;
