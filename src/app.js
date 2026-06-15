import cors from 'cors';
import express from 'express';
import env from './config/env.js';
import cookieParser from 'cookie-parser';
import { getHealth } from './controllers/healthController.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import authController from './controllers/authController.js';
import transactionController from './controllers/transactionController.js';
import userController from './controllers/userController.js';
import detailController from './controllers/detailController.js';
import mySaleController from './controllers/mySaleController.js';
import notificationController from './controllers/notificationController.js';
import passport from 'passport';
import './config/passport.js';
import galleryController from './controllers/galleryController.js';
import cardController from './controllers/cardController.js';

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

app.get('/health', getHealth);

app.use('/auth', authController);

app.use('/users', userController);

// 포토 카드
app.use('/cards', cardController);

// 포토 카드 거래(매매)
app.use('/transactions', transactionController);

// 포토 카드 상세
app.use('/market', detailController);

// 마이갤러리
app.use('/gallery', galleryController);

// 나의 판매 포토카드
app.use('/my-sales', mySaleController);

//알림
app.use('/notifications', notificationController);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server is running on port ${env.port}`);
});

export default app;
