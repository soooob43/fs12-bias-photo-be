import { getMySales } from '../services/mySaleService.js';

export const getMySalesController = async (req, res) => {
  try {
    const sellerId = req.auth.userId;

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 15),);

    const status = req.query.status;

    const allowedStatus = [
      'ON_SALE',
      'ON_EXCHANGE',
      'SOLD_OUT',
    ];

    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({
        message: '유효하지 않은 상태값입니다.',
      });
    }

    const result = await getMySales({
      sellerId,
      page,
      limit,
      status,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "나의 판매 포토카드 조회 실패",
    });
  }
};