import express from 'express';
import { signupSchema } from '../schemas/auth.schema.js';

const authController = express.Router();

authController.post('/signup', async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
});

export default authController;
