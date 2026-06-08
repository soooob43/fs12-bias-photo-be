import express from 'express';
import { verifyAccessToken } from '../middlewares/auth.js';
import userService from '../services/userService.js';

const userController = express.Router();

userController.get('/me', verifyAccessToken, async (req, res, next) => {
  try {
    const user = await userService.getMe(req.auth.userId);
    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
});

export default userController;
