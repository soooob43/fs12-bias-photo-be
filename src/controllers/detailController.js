import express from 'express';
import detailService from '../services/detailService.js';

const router = express.Router();

router.get('/:transactionId', async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const data = await detailService.getPhotocard(transactionId);

    return res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
