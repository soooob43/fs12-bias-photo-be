import detailRepository from '../repositories/detailRepository.js';
import AppError from '../utils/appError.js'; // 공통 에러 핸들러 추가
import {
  createPurchaseNotification,
  createSoldOutNotification,
  createTradeOfferNotification,
} from './notificationService.js';

//카드 정보 조회
const getPhotocard = async (transactionId) => {
  const transaction = await detailRepository.getMarketDetail(transactionId);

  //해당 ID 포토카드 판매 정보가 없는 경우
  if (!transaction) {
    throw AppError(
      404,
      'TRANSACTION_NOT_FOUND',
      '해당 포토카드의 판매 정보를 찾을 수 없습니다.',
    );
  }

  return transaction;
};

//포토카드 구매
const purchasePhotocard = async ({ transactionId, buyerId, quantity }) => {
  //파라미터 유효성 검증
  if (!transactionId || !buyerId || !quantity || quantity <= 0) {
    throw AppError(400, 'BAD_REQUEST', '올바른 구매 요청 정보가 아닙니다.');
  }
  return await detailRepository.purchasePhotocard({
    transactionId,
    buyerId,
    quantity,
  });
};

// 교환 제안 등록
const createExchangeOffer = async ({
  transactionId,
  proposerId,
  offeredCardId,
  description,
}) => {
  //파라미터 유효성 검증
  if (!transactionId || !offeredCardId || !proposerId) {
    throw AppError(400, 'BAD_REQUEST', '요청 정보가 부족합니다.');
  }
  const result = await detailRepository.createExchangeOffer({
    listingId: transactionId,
    proposerId,
    offeredCardId,
    description,
  });
  console.log(result);
  console.log('알림 생성 시작');

  await createTradeOfferNotification({
    sellerId: result.saleInfo.sellerId,
    proposerNickname: result.proposer.nickname,
    cardGrade: result.saleInfo.card.grade,
    cardTitle: result.saleInfo.card.title,
  });

  return result;
};

//교환 제안 목록 조회
const getExchangeOffer = async (transactionId) => {
  const transaction = await detailRepository.getExchangeOffer(transactionId);

  if (!transaction) {
    throw AppError(
      404,
      'TRANSACTION_NOT_FOUND',
      '해당 포토카드의 교환 제안 정보를 찾을 수 없습니다.',
    );
  }
  return transaction;
};

//판매글 내리기 (삭제)
const deleteCardTransaction = async (transactionId) => {
  const transaction =
    await detailRepository.deleteCardTransaction(transactionId);

  if (!transaction) {
    throw AppError(
      404,
      'TRANSACTION_NOT_FOUND',
      '해당 포토카드의 교환 제안 정보를 찾을 수 없습니다.',
    );
  }
  return transaction;
};

export default {
  getPhotocard,
  purchasePhotocard,
  getExchangeOffer,
  createExchangeOffer,
  deleteCardTransaction,
};
