import express from 'express';
import validate from '../middlewares/validate.js';
import { verifyAccessToken } from '../middlewares/auth.js';
import galleryService from '../services/galleryService.js';

const galleryController = express.Router();

// 회원별 마이갤러리 목록 조회
galleryController.get('/', async (req, res, next) => {
  try {
    const { userId } = req.query;
    const result = await galleryService.getAllGalleryList(userId);
    return res.status(200).json({
      message: '마이갤러리 목록 조회가 완료되었습니다.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default galleryController;
