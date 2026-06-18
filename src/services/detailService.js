import detailRepository from '../repositories/detailRepository.js';
import AppError from '../utils/appError.js'; // 공통 에러 핸들러 추가
import {
  createPurchaseNotification,
  createSoldOutNotification,
  createTradeOfferNotification,
  createTradeAcceptedNotification,
  createTradeRejectedNotification,
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

  // 해당 판매 정보가 삭제되었을 경우
  if (transaction.isDeleted) {
    throw AppError(
      410,
      'TRANSACTION_DELETED',
      '해당 포토카드의 판매 정보가 삭제되었습니다.',
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
  const result = await detailRepository.purchasePhotocard({
    transactionId,
    buyerId,
    quantity,
  });

  await createPurchaseNotification({
    sellerId: result.saleInfo.seller.id,
    buyerNickname: result.buyerNickname,
    cardGrade: result.saleInfo.card.grade,
    cardTitle: result.saleInfo.card.title,
    quantity,
  });

  if (result.transaction.remainingQuantity === 0) {
    await createSoldOutNotification({
      sellerId: result.saleInfo.seller.id,
      cardGrade: result.saleInfo.card.grade,
      cardTitle: result.saleInfo.card.title,
    });
  }

  return result;
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

const deleteExchange = async (exchangeOfferId) => {
  if (!exchangeOfferId) {
    throw AppError(
      404,
      'TRANSACTION_NOT_FOUND',
      '교환 제안된 대상 정보를 찾을 수 없습니다.',
    );
  }

  const result =
    await detailRepository.deleteExchange(exchangeOfferId);

  await createTradeRejectedNotification({
    proposerId: result.proposerId,
    sellerNickname: result.sellerNickname,
    cardGrade: result.cardGrade,
    cardTitle: result.cardTitle,
  });

  return result;
};

//판매글 내리기 (삭제)
const deleteCardTransaction = async (transactionId) => {
  const transaction =
    await detailRepository.deleteCardTransaction(transactionId);

  if (!transaction) {
    throw AppError(
      404,
      'TRANSACTION_NOT_FOUND',
      '해당 포토카드의 판매 정보를 찾을 수 없습니다.',
    );
  }
  return transaction;
};

//교환 수락하기
const acceptExchangeOffer = async ({ exchangeOfferId, loginId }) => {
  //파라미터 유효성 검증
  if (!exchangeOfferId || !loginId) {
    throw AppError(
      400,
      'BAD_REQUEST',
      '요청 정보가 부족합니다.',
    );
  }

  const result = await detailRepository.acceptExchangeOffer({
    exchangeOfferId,
    loginId,
  });

  await createTradeAcceptedNotification({
    proposerId: result.proposerId,
    sellerNickname: result.sellerNickname,
    cardGrade: result.cardGrade,
    cardTitle: result.cardTitle,
  });

  return result;
};

export default {
  getPhotocard,
  purchasePhotocard,
  getExchangeOffer,
  createExchangeOffer,
  deleteExchange,
  deleteCardTransaction,
  acceptExchangeOffer,
};