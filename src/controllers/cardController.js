import express from 'express';
import cardService from '../services/cardService.js';
import { verifyAccessToken } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { cardSchema } from '../schemas/card.schema.js';

const cardController = express.Router();

/*-----------------------------------------
    Cloudinary 업로드용 서명 발급 - 최혜성
 ------------------------------------------*/
cardController.get('/upload-signature', verifyAccessToken, (req, res, next) => {
  try {
    const signatureData = cardService.generateUploadSignature();

    res.status(200).json(signatureData);
  } catch (error) {
    next(error);
  }
});

/*-----------------------------
    포토 카드 생성 - 최혜성
------------------------------*/
cardController.post(
  '/',
  verifyAccessToken,
  validate(cardSchema),
  async (req, res, next) => {
    try {
      const creatorId = req.auth.userId;
      const cardData = req.body;

      const newCard = await cardService.createCard(creatorId, cardData);

      res.status(201).json({
        message: '포토카드가 성공적으로 등록되었습니다.',
        data: newCard,
      });
    } catch (error) {
      next(error);
    }
  },
);

/*----------------------------------
  포토 카드 생성 횟수 조회 - 최혜성
-----------------------------------*/
cardController.get(
  '/remaining-count',
  verifyAccessToken,
  async (req, res, next) => {
    try {
      const userId = req.auth.userId;

      const result = await cardService.getRemainingCreateCount(userId);

      res.status(201).json({
        message: '남은 포토카드 생성 횟수를 성공적으로 조회했습니다.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default cardController;
