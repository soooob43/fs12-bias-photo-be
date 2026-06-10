import { OwnershipStatus } from '@prisma/client';
import transactionRepository from '../repositories/transactionRepository.js';
import prisma from '../config/prisma.js';
import AppError from '../utils/appError.js';
import { CardGenre, CardGrade } from '@prisma/client';

const GRADES = ['COMMON', 'RARE', 'SUPER_RARE', 'LEGENDARY'];
const GENRES = [
  'ALBUM',
  'CONCERT',
  'FAN_SIGN',
  'FAN_MEETING',
  'SEASON_GREETING',
  'BENEFIT',
  'MD',
  'COLLAB',
  'ETC',
  'FAN_CLUB',
];
const STATUSES = ['ON_SALE', 'SOLD_OUT'];

/*---------------------------
  포토 카드 조회
  add : 2026.06.08 윤소정
  fix : 2026.06.10 검색 및 정렬 추가

  ---반환--- 
  [
  {
    cardId: 1,
    title: 'A 카드',
    quantity: 2,
    ownershipIds: [10, 11]
  },
  {
    cardId: 2,
    title: 'B 카드',
    quantity: 1,
    ownershipIds: [20]
  }
]
----------------------------*/
const getAvailableCards = async (userId, queryOptions = {}) => {
  const keyword = queryOptions.keyword?.trim();
  const { grade, genre } = queryOptions;

  if (grade && !Object.values(CardGrade).includes(grade)) {
    throw AppError(400, 'INVALID_CARD_GRADE', '유효하지 않은 등급입니다.');
  }

  if (genre && !Object.values(CardGenre).includes(genre)) {
    throw AppError(400, 'INVALID_CARD_GENRE', '유효하지 않은 장르입니다. ');
  }

  //소유권을 갖고 있는 카드 조회
  const ownerships = await transactionRepository.findAvailableCardOwnerships(
    userId,
    {
      keyword,
      grade,
      genre,
    },
  );

  //cardId를 기준으로 묶음 = > 발행량만큼 카드를 만들기때문
  const cardsById = ownerships.reduce((acc, ownership) => {
    const cardId = ownership.card.id;
    const existingCard = acc.find((card) => card.cardId === cardId);

    if (existingCard) {
      existingCard.quantity += 1; //같은 카드가 있다면 +1
      existingCard.ownershipIds.push(ownership.id); //카드 소유권 Id 추가
    } else {
      //새로운 카드인 경우 생성
      acc.push({
        cardId,
        title: ownership.card.title,
        imageUrl: ownership.card.imageUrl,
        description: ownership.card.description,
        grade: ownership.card.grade,
        genre: ownership.card.genre,
        minimumPrice: ownership.card.minimumPrice,
        quantity: 1,
        ownershipIds: [ownership.id],
      });
    }
    return acc;
  }, []);
  return cardsById;
};

/*---------------------------
      포토 카드 판매 등록
----------------------------*/
const createTransaction = async (sellerId, transactionData) => {
  /*-------------------------
          검증 로직
  -------------------------*/
  const { ownershipIds, cardId } = transactionData;

  const uniqueOwnershipIds = ownershipIds.filter((id, idx) => {
    return ownershipIds.indexOf(id) === idx;
  });

  if (uniqueOwnershipIds.length !== ownershipIds.length) {
    throw AppError(400, 'DUPLICATE_CARDS', '중복된 포토카드가 선택되었습니다.');
  }

  const ownerships =
    await transactionRepository.findOwnershipsByIds(ownershipIds);

  if (ownerships.length !== ownershipIds.length) {
    throw AppError(404, 'CARD_NOT_FOUND', '일부 카드를 찾을 수 없습니다.');
  }
  for (const ownership of ownerships) {
    if (ownership.ownerId !== sellerId) {
      throw AppError(
        403,
        'NOT_CARD_OWNER',
        '본인이 소유한 카드만 판매할 수 있습니다.',
      );
    }
    if (ownership.status !== OwnershipStatus.IN_GALLERY) {
      throw AppError(
        400,
        'CARD_NOT_IN_GALLERY',
        '현재 갤러리에 보유 중인 카드만 판매할 수 있습니다.',
      );
    }
    if (ownership.cardId !== cardId) {
      throw AppError(
        400,
        'MIXED_CARD_TYPES',
        '선택한 카드 중에 다른 종류의 도안이 섞여 있습니다.',
      );
    }
  }

  const createdData = await transactionRepository.saveTransaction({
    sellerId,
    ...transactionData,
  });

  return createdData;
};

/*---------------------------
  포토 카드 판매 내역 전체 조회
----------------------------*/
const getAllTransactionsList = async (cursor, limit, queryOptions) => {
  const parsedLimit = parseInt(limit, 10) || 10;
  const parsedCursor = cursor ? parseInt(cursor, 10) : undefined;

  const transactions = await transactionRepository.getTransactions(
    parsedCursor,
    parsedLimit,
    queryOptions,
  );

  let nextCursor = null;
  if (transactions.length === parsedLimit) {
    nextCursor = transactions[transactions.length - 1].id;
  }

  return {
    transactions,
    nextCursor,
  };
};

/*-----------------------------------------------
  포토 카드 판매 내역 필터 메타데이터 조회 - 최혜성
-------------------------------------------------*/
const getTransactionFiltersMeta = async () => {
  // 각 옵션별 쿼리 준비
  const gradePromises = GRADES.map(async (grade) => ({
    grade,
    count: await transactionRepository.countTransactionsByGrade(grade),
  }));

  const genrePromises = GENRES.map(async (genre) => ({
    genre,
    count: await transactionRepository.countTransactionsByGenre(genre),
  }));

  const statusPromises = STATUSES.map(async (status) => ({
    status,
    count: await transactionRepository.countTransactionsBySaleStatus(status),
  }));

  // 병렬 처리
  const [gradeResults, genreResults, statusResults, totalPhotos] =
    await Promise.all([
      Promise.all(gradePromises),
      Promise.all(genrePromises),
      Promise.all(statusPromises),
      transactionRepository.countAllTransactions(),
    ]);

  // 객체 형태로 변환
  const counts = {
    grade: gradeResults.reduce((acc, { grade, count }) => {
      acc[grade] = count;
      return acc;
    }, {}),
    genre: genreResults.reduce((acc, { genre, count }) => {
      acc[genre] = count;
      return acc;
    }, {}),
    saleStatus: statusResults.reduce((acc, { status, count }) => {
      acc[status] = count;
      return acc;
    }, {}),
  };

  return { counts, totalPhotos };
};

const transactionService = {
  createTransaction,
  getAllTransactionsList,
  getAvailableCards,
  getTransactionFiltersMeta,
};

export default transactionService;
