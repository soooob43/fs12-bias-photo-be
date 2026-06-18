import prisma from '../config/prisma.js';
import AppError from '../utils/appError.js'; // 공통 에러 핸들러 추가

//카드 상세 페이지 관련 정보 조회 API
const getMarketDetail = async (transactionId) => {
  return await prisma.transaction.findUnique({
    where: {
      id: Number(transactionId),
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

//구매자뷰 상세페이지 내 포토카드 구매하기 API (다수테이블 변경으로 1개 트랜잭션으로 원자성 보장)
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

    //총 구매금액 (포인트 증감 시 사용)
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
    //판매글 대상 카드이면서, 판매자 소유이면서, 판매중인 카드 중 구매수량만큼만 조회
    const ownershipsToTransfer = await t.cardOwnership.findMany({
      where: {
        transactionId: transaction.id,
        ownerId: transaction.sellerId,
        status: 'ON_SALE', // 판매하기 기능에서 판매중으로 전환된 카드 대상
      },
      take: quantity, // 예를 들어 2개 구매면 판매 카드 4장 중에 2장만큼만 로드
    });

    // 판매자 소유 판매중 데이터가 구매수량 보다 적은 경우
    if (ownershipsToTransfer.length < quantity) {
      throw AppError(
        409,
        'CARD_NOT_FOUND',
        '이전할 수 있는 판매자의 카드 소유권 데이터가 부족합니다.',
      );
    }

    // 하단 소유권 이전 로직을 위해 소유권 전환 대상 객체에서 id 추출
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
        transactionId: null, //판매중이지 않으므로 null 전환
      },
    });

    // 판매카드 잔여수량 차감
    const updatedTransaction = await t.transaction.update({
      where: { id: Number(transactionId) },
      data: {
        remainingQuantity: { decrement: quantity },
      },
    });

    //판매히스토리 추가
    const history = await t.transactionHistory.create({
      data: {
        sellerId: transaction.sellerId,
        buyerId: buyerId,
        cardId: transaction.cardId,
        type: 'TRADE',
        price: totalPrice,
      },
    });
    // 리렌더링용 신규 데이터 반환 및 로그용 데이터 반환
    const saleInfo = await t.transaction.findUnique({
      where: {
        id: Number(transactionId),
      },
      include: {
        card: {
          select: {
            title: true,
            grade: true,
          },
        },
        seller: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    return {
      transaction: updatedTransaction,
      history,
      saleInfo,
      buyerNickname: buyer.nickname,
    };
  });
};

//구매자뷰 상세페이지 내 포토카드 교환 요청 API (다수테이블 변경으로 1개 트랜잭션으로 원자성 보장)
//Props (listingId: 거래고유ID, proposerId: 교환희망자ID, offeredCardId: 교환요청카드ID(cardOwnership 상의 ID), description: 교환내용설명)
const createExchangeOffer = async ({
  listingId,
  proposerId,
  offeredCardId,
  description,
}) => {
  return await prisma.$transaction(async (t) => {
    //대상 판매글 조회
    const transaction = await t.transaction.findUnique({
      where: {
        id: Number(listingId),
      },
      include: {
        card: {
          select: {
            title: true,
            grade: true,
          },
        },
      },
    });

    if (!transaction || transaction.isDeleted) {
      throw AppError(
        404,
        'TRANSACTION_NOT_FOUND',
        '존재하지 않거나 삭제된 판매글에는 교환 제안을 할 수 없습니다.',
      );
    }

    // 교환제안하는 카드의 정보 조회
    const myCardOwnership = await t.cardOwnership.findUnique({
      where: { id: Number(offeredCardId) },
    });

    //카드 소유자 정보 및 보유중인 상태 확인
    if (
      !myCardOwnership ||
      myCardOwnership.ownerId !== proposerId ||
      myCardOwnership.status !== 'IN_GALLERY'
    ) {
      throw AppError(
        400,
        'CARD_NOT_AVAILABLE',
        '제시하신 카드가 없거나, 현재 교환 가능한 상태(보유중)가 아닙니다.',
      );
    }

    //카드 소유 상태를 보유중(IN_GALLERY) -> 교환중(ON_EXCHANGE)으로 변경
    await t.cardOwnership.update({
      where: { id: Number(offeredCardId), status: 'IN_GALLERY' },
      data: {
        status: 'ON_EXCHANGE',
      },
    });

    //교환 제안 목록(ExchangeOffer) 테이블에 새로운 레코드 생성
    const newOffer = await t.exchangeOffer.create({
      data: {
        listingId: Number(listingId),
        proposerId: proposerId,
        offeredCardId: Number(offeredCardId),
        description: description || null,
      },
      include: {
        proposer: {
          select: { nickname: true },
        },
        offeredCard: {
          include: { card: true },
        },
      },
    });

    return {
      ...newOffer,
      saleInfo: transaction,
    };
  });
};

//판매자뷰 상세 페이지 하단 교환 제안 목록 조회 API
const getExchangeOffer = async (transactionId) => {
  return await prisma.exchangeOffer.findMany({
    where: {
      listingId: Number(transactionId), //해당 카드에 대한 교환 제안 목록
      isDeleted: false, // 교환 취소되지 않은 카드
    },
    include: {
      proposer: {
        select: {
          nickname: true, // 제안자 유저 닉네임
        },
      },
      offeredCard: {
        // 제안한 카드 소유권 정보
        include: {
          card: true, // 제안한 카드의 실제 이미지/도안 정보까지 묶어서 로드
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

//판매자뷰 상세 페이지 내 교환 거절 및 구매자페이지 내 교환 취소하기 API (2개 테이블 변경으로 1개 트랜잭션으로 원자성 보장)
//교환제안목록 테이블 내 "isDeleted: true"로 변경 및 카드소유권 테이블 내 "status: ON_EXCHANGE -> status: IN_GALLERY"로 변경)
const deleteExchange = async (exchangeOfferId) => {
  return await prisma.$transaction(async (t) => {
    const exchangeOffer = await t.exchangeOffer.findUnique({
      where: { id: Number(exchangeOfferId) },
      include: {
        offeredCard: true,
      },
    });

    if (!exchangeOffer) {
      throw AppError(
        404,
        'OFFER_NOT_FOUND',
        '해당 교환 제안을 찾을 수 없습니다.',
      );
    }

    if (
      !exchangeOffer.offeredCard ||
      exchangeOffer.offeredCard.status !== 'ON_EXCHANGE'
    ) {
      throw AppError(
        400,
        'INVALID_STATUS',
        '교환 제시 중인 카드만 취소/거절할 수 있습니다.',
      );
    }

    //교환 제안한 카드에 대한 상태를 교환중->보유중 으로 변경
    await t.cardOwnership.update({
      where: {
        id: exchangeOffer.offeredCardId,
      },
      data: {
        status: 'IN_GALLERY',
      },
    });

    //교환제안의 isDeleted 값을 true로 변경하여 교환제안카드 안보이게 하기
    return await t.exchangeOffer.update({
      where: {
        id: exchangeOffer.id,
      },
      data: {
        isDeleted: true,
      },
    });
  });
};

//판매자뷰 상세 페이지 내 판매내리기 API (2개 테이블 변경으로 1개 트랜잭션으로 원자성 보장)
//거래 테이블 내 "isDeleted: true"로 변경 및 카드소유권 테이블 내 "status: ON_SALE -> status: IN_GALLERY"로 변경)
const deleteCardTransaction = async (transactionId) => {
  return await prisma.$transaction(async (t) => {
    const transaction = await t.transaction.findUnique({
      where: { id: Number(transactionId) },
    });

    if (!transaction) {
      throw AppError(
        404,
        'TRANSACTION_NOT_FOUND',
        '해당 판매 정보를 찾을 수 없습니다.',
      );
    }

    // 판매글에 포함된 n개 카드에 대한 상태를 판매중->보유중 으로 변경
    await t.cardOwnership.updateMany({
      where: {
        transactionId: transaction.id,
        status: 'ON_SALE',
      },
      data: {
        status: 'IN_GALLERY',
      },
    });

    //판매글의 isDeleted 값을 true로 변경하여 판매글 안보이게 하기
    return await t.transaction.update({
      where: { id: Number(transactionId) },
      data: {
        isDeleted: true,
      },
    });
  });
};

// 판매자뷰 상세 페이지 내 교환 제안 수락 API (다수 테이블 변경으로 원자성 보장)
// Props (exchangeOfferId: 수락할 교환 제안 고유 ID, loginId: 로그인한 본인 ID)
const acceptExchangeOffer = async ({ exchangeOfferId, loginId }) => {
  return await prisma.$transaction(async (t) => {
    // 교환 제안 조회 및 검증
    const exchangeOffer = await t.exchangeOffer.findUnique({
      where: { id: Number(exchangeOfferId) },
      include: {
        listing: true, // transaction 테이블
      },
    });

    if (!exchangeOffer || exchangeOffer.isDeleted) {
      throw AppError(
        404,
        'EXCHANGE_OFFER_NOT_FOUND',
        '존재하지 않거나 이미 취소/삭제된 교환 제안입니다.',
      );
    }

    const transaction = exchangeOffer.listing; // 교환 제안된 판매글 데이터

    // 현재 로그인한 유저가 해당 판매글 판매자인지 확인
    if (transaction.sellerId !== loginId) {
      throw AppError(
        403,
        'UNAUTHORIZED_ACTION',
        '본인의 판매글에 온 제안만 수락할 수 있습니다.',
      );
    }

    // 교환 가능 여부 확인
    if (transaction.remainingQuantity < 1) {
      throw AppError(
        400,
        'MARKET_STOCK_SHORTAGE',
        '교환 가능한 잔여 카드가 없습니다.',
      );
    }

    // 교환 제안 온 대상 카드 소유권 이전
    // 소유자: 제안자 -> 판매자(나), 상태: ON_EXCHANGE -> IN_GALLERY, transactionId: null
    await t.cardOwnership.update({
      where: { id: exchangeOffer.offeredCardId },
      data: {
        ownerId: transaction.sellerId, // 소유권을 판매자에게 이전
        status: 'IN_GALLERY', // 다시 일반 보유중 상태로 변경
        transactionId: null, // 거래글 종속 해제
      },
    });

    // 내가 판매중인 카드 중 '1장만' 조회하여 소유권 이전
    const sellerCardToTransfer = await t.cardOwnership.findFirst({
      where: {
        transactionId: transaction.id,
        ownerId: transaction.sellerId,
        status: 'ON_SALE',
      },
    });

    if (!sellerCardToTransfer) {
      throw AppError(
        404,
        'CARD_NOT_FOUND',
        '이전할 수 있는 판매자의 카드 소유권 데이터가 부족합니다.',
      );
    }

    // 내 카드 1장에 대한 소유권 변경
    // 소유자: 판매자(나) -> 제안자, 상태: ON_SALE -> IN_GALLERY, transactionId: null
    await t.cardOwnership.update({
      where: { id: sellerCardToTransfer.id },
      data: {
        ownerId: exchangeOffer.proposerId, // 소유권을 제안자에게 이전
        status: 'IN_GALLERY', // 다시 일반 보유중 상태로 변경
        transactionId: null, // 거래글 종속 해제
      },
    });

    // 판매카드 잔여수량 1장 차감
    await t.transaction.update({
      where: { id: transaction.id },
      data: {
        remainingQuantity: { decrement: 1 },
      },
    });

    // 교환 제안 레코드의 isDeleted 필드를 true로 변경(교환제안 목록에서 안보이게 함)
    return await t.exchangeOffer.update({
      where: { id: exchangeOffer.id },
      data: {
        isDeleted: true,
      },
    });
  });
};

export default {
  getMarketDetail,
  purchasePhotocard,
  createExchangeOffer,
  getExchangeOffer,
  deleteExchange,
  deleteCardTransaction,
  acceptExchangeOffer,
};
