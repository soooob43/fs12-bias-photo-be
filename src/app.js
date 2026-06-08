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
import detailController from './controllers/DetailController.js';

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', getHealth);

app.use('/auth', authController);

app.use('/users', userController);

// 포토 카드 거래(매매)
app.use('/transactions', transactionController);

// 포토 카드 상세
app.use('/market', detailController);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Server is running on port ${env.port}`);
});

export default app;
