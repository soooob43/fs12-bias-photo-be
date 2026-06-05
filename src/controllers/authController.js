import express from 'express';
import { loginSchema, signupSchema } from '../schemas/auth.schema.js';
import validate from '../middlewares/validate.js';
import authService from '../services/authService.js';

const authController = express.Router();

authController.post(
  '/signup',
  validate(signupSchema),
  async (req, res, next) => {
    try {
      const user = await authService.signup(req.validatedData);
      return res
        .status(201)
        .json({ message: '회원가입이 완료되었습니다.', user });
    } catch (error) {
      next(error);
    }
  },
);

authController.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const result = await authService.login(req.validatedData);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
    });
    return res.status(200).json({
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
});

export default authController;
