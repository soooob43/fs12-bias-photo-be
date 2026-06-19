import express from 'express';
import { verifyAccessToken } from '../middlewares/auth.js';
import pointsService from '../services/pointsService.js';

const pointsController = express.Router();

pointsController.get(
  '/random-box',
  verifyAccessToken,
  async (req, res, next) => {
    try {
      const userId = req.auth.userId;
      const nextAvailableAt = await pointsService.getRandomBoxStatus(userId);

      return res.status(200).json(nextAvailableAt);
    } catch (error) {
      next(error);
    }
  },
);

pointsController.post(
  '/random-box',
  verifyAccessToken,
  async (req, res, next) => {
    try {
      const userId = req.auth.userId;

      const earnedPoints = await pointsService.drawRandomPoint(userId);

      return res.status(200).json(earnedPoints);
    } catch (error) {
      next(error);
    }
  },
);

export default pointsController;
