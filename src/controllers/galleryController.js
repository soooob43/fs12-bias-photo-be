import express from 'express';
import { verifyAccessToken } from '../middlewares/auth.js';
import galleryService from '../services/galleryService.js';

const galleryController = express.Router();

// 회원별 마이갤러리 목록 조회
/*---------------------------
 마이갤러리 조회 
  refactor : 2026.06.12 윤소정

  검색 필터 페이지네이션 값 전달 추가함
----------------------------*/
galleryController.get('/', verifyAccessToken, async (req, res, next) => {
  try {
    const userId = req.auth.userId;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(30, Math.max(1, Number(req.query.limit) || 6));

    const { keyword, grade, genre } = req.query;

    const result = await galleryService.getAllGalleryList(userId, {
      page,
      limit,
      keyword,
      grade,
      genre,
    });

    return res.status(200).json({
      message: '마이갤러리 목록 조회가 완료되었습니다.',
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

export default galleryController;
