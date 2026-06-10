import prisma from '../config/prisma.js';
import AppError from '../utils/appError.js'; // 공통 에러 핸들러 추가

//카드 상세 페이지 조회 API
const getMarketDetail = async (transactionId) => {
  return await prisma.transaction.findUnique({
    where: {
      id: Number(transactionId),
      isDeleted: false, // 삭제되지 않은 판매정보만 불러오기
    },
    select: {
      // transaction 필요 정보
      id: true,
      sellerId: true,
      price: true,
      totalQuantity: true,
      remainingQuantity: true,
      exchangeGrade: true,
      exchangeGenre: true,
      exchangeDescription: true,
      createdAt: true,
      updatedAt: true,
      isDeleted: true,

      // card 테이블 정보 모두
      card: true,

      // seller id, nickname 만
      seller: {
        select: {
          id: true,
          nickname: true,
        },
      },
    },
  });
};

//포토카드 구매하기 API (다수테이블 변화가 발생하므로 1개 트랜잭션으로 일괄 처리)
//Props (transactionId: 거래고유ID, buyerId: 구매희망자:ID, quantity: 구매희망수량)
const purchasePhotocard = async ({ transactionId, buyerId, quantity }) => {
  return await prisma.$transaction(async (t) => {
    //거래 정보 조회 (가격 및 판매자 확인)
    const transaction = await t.transaction.findUnique({
      where: { id: Number(transactionId) },
    });

    if (!transaction || transaction.isDeleted) {
      throw AppError(
        404,
        'TRANSACTION_NOT_FOUND',
        '해당 포토카드의 판매 정보를 찾을 수 없습니다.',
      );
    }

    if (transaction.remainingQuantity < quantity) {
      throw AppError(
        400,
        'MARKET_STOCK_SHORTAGE',
        '구매 가능한 잔여 수량이 부족합니다.',
      );
    }

    //총 구매금액
    const totalPrice = transaction.price * quantity;

    //구매자 포인트 조회
    const buyer = await t.user.findUnique({
      where: { id: buyerId },
      include: { point: true },
    });

    if (!buyer || !buyer.point || buyer.point.balance < totalPrice) {
      throw AppError(
        400,
        'USER_POINT_INSUFFICIENT',
        '보유하신 포인트가 부족하여 구매할 수 없습니다.',
      );
    }

    // 구매자 포인트 차감
    await t.userPoint.update({
      where: { userId: buyerId },
      data: {
        balance: { decrement: totalPrice },
      },
    });

    // 판매자 포인트 증가
    await t.userPoint.update({
      where: { userId: transaction.sellerId },
      data: {
        balance: { increment: totalPrice },
      },
    });

    // 카드 소유권 이전
    const ownershipsToTransfer = await t.cardOwnership.findMany({
      where: {
        transactionId: transaction.id,
        ownerId: transaction.sellerId,
        status: 'ON_SALE', // 판매하기 기능에서 판매중으로 전환된 카드 대상
      },
      take: quantity, // 구매 수량만큼의 데이터만 랜덤 호출
    });

    // 판매자 소유 판매중 데이터가 구매수량 보다 적은 경우
    if (ownershipsToTransfer.length < quantity) {
      throw AppError(
        409,
        'CARD_NOT_FOUND',
        '이전할 수 있는 판매자의 카드 소유권 데이터가 부족합니다.',
      );
    }

    // 소유권 이전을 위한 id 추출
    const ownershipIds = ownershipsToTransfer.map((item) => item.id);

    //ownershipIds에 포함된 모든 카드 소유권 변경
    await t.cardOwnership.updateMany({
      where: {
        id: { in: ownershipIds },
      },
      data: {
        ownerId: buyerId, // 소유자를 구매자로 변경!
        status: 'IN_GALLERY', // 상태를 다시 보유중으로 변경!
        purchasePrice: transaction.price, // 구매 시점의 실거래가로 갱신
        transactionId: NULL,
      },
    });

    // 판매카드 잔여수량 차감 및 신규 데이터 반환
    const updatedTransaction = await t.transaction.update({
      where: { id: Number(transactionId) },
      data: {
        remainingQuantity: { decrement: quantity },
      },
    });

    //판매히스토리 추가 및 반환(로그)
    const history = await t.transactionHistory.create({
      data: {
        sellerId: transaction.sellerId,
        buyerId: buyerId,
        cardId: transaction.cardId,
        type: 'TRADE',
        price: totalPrice,
      },
    });

    return { transaction: updatedTransaction, history };
  });
};

export default {
  getMarketDetail,
  purchasePhotocard,
};
