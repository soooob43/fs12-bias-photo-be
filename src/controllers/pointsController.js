import express from 'express';
import { verifyAccessToken } from '../middlewares/auth.js';
import pointsService from '../services/pointsService.js';

const pointsController = express.Router();

pointsController.post('/draw', verifyAccessToken, async (req, res, next) => {
  try {
    const userId = req.auth.userId;

    const { earnedPoints, nextAvailableAt } =
      await pointsService.drawRandomPoint(userId);

    return res.status(200).json({ earnedPoints, nextAvailableAt });
  } catch (error) {
    next(error);
  }
});

export default pointsController;
