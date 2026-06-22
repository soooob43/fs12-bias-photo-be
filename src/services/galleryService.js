import galleryRepository from '../repositories/galleryRepository.js';
import { CardGenre, CardGrade } from '@prisma/client';
import AppError from '../utils/appError.js';

// 회원별 마이갤러리 목록 조회
// ownerships 테이블 조회(owner_id)
// 현재 상태가 IN_GALLERY인 경우만 조회
// group으로 card id 묶어주는 작업 필요 -> 협의 후 findAvailableCardOwnerships 함수 로직 수정(조건 추가) or 별도 함수 추가 예정
// 검색, 필터, 페이지네이션 추가 작업 진행중
//
// const getAllGalleryList = async (userId) => {
//   const ownerships =
//     await transactionRepository.findAvailableCardOwnerships(userId);

//   return ownerships;
// };

// const galleryService = {
//   getAllGalleryList,
// };

// export default galleryService;

/*---------------------------
 마이갤러리 조회 
  add : 2026.06.12 윤소정

 등급별 수량 계산 : getGradeCounts()
 검색 : filterCards() - matchesKeyword : 제목과 설명 검색 가능
 등급 필터 : matchesGrade
 장르 필터 : matchesGenre
 페이지네이션
 동일 카드 그룹화 : groupCards()
 판매 중 카드 제외는 이미 레퍼지토리에서 IN_GALLERY 상태만 조회하고 있음
----------------------------*/

const INITIAL_GRADE_COUNTS = {
  COMMON: 0,
  RARE: 0,
  SUPER_RARE: 0,
  LEGENDARY: 0,
};

// 같은 cardId를 가진 소유권을 하나의 카드로 묶음
const groupCards = (ownerships) => {
  const cardMap = new Map();

  ownerships.forEach((ownership) => {
    const card = ownership.card;
    const existingCard = cardMap.get(card.id);

    if (existingCard) {
      existingCard.quantity += 1;
      existingCard.ownershipIds.push(ownership.id);
      return;
    }

    cardMap.set(card.id, {
      cardId: card.id,
      title: card.title,
      imageUrl: card.imageUrl,
      description: card.description,
      grade: card.grade,
      genre: card.genre,
      minimumPrice: card.minimumPrice,
      creatorNickname: card.creator.nickname,
      quantity: 1,
      ownershipIds: [ownership.id],
      ownedAt: ownership.createdAt,
    });
  });

  return Array.from(cardMap.values());
};

// 전체 보유 카드의 등급별 수량 계산
const getGradeCounts = (cards) => {
  return cards.reduce(
    (counts, card) => {
      counts[card.grade] += card.quantity;
      return counts;
    },
    { ...INITIAL_GRADE_COUNTS },
  );
};

// 검색어, 등급, 장르 필터 적용
const filterCards = (cards, { keyword, grade, genre }) => {
  const normalizedKeyword = keyword?.trim().toLowerCase();

  return cards.filter((card) => {
    const matchesKeyword =
      !normalizedKeyword ||
      card.title.toLowerCase().includes(normalizedKeyword) ||
      card.description?.toLowerCase().includes(normalizedKeyword);

    const matchesGrade = !grade || card.grade === grade;
    const matchesGenre = !genre || card.genre === genre;

    return matchesKeyword && matchesGrade && matchesGenre;
  });
};

const getAllGalleryList = async (
  userId,
  { page = 1, limit = 6, keyword, grade, genre } = {},
) => {
  if (grade && !Object.values(CardGrade).includes(grade)) {
    throw AppError(400, 'INVALID_CARD_GRADE', '유효하지 않은 카드 등급입니다.');
  }

  if (genre && !Object.values(CardGenre).includes(genre)) {
    throw AppError(400, 'INVALID_CARD_GENRE', '유효하지 않은 카드 장르입니다.');
  }

  const ownerships = await galleryRepository.findGalleryOwnerships(userId);

  const groupedCards = groupCards(ownerships);

  // 필터 적용 전 전체 보유 현황 계산
  const totalQuantity = ownerships.length;
  const gradeCounts = getGradeCounts(groupedCards);

  const filteredCards = filterCards(groupedCards, {
    keyword,
    grade,
    genre,
  });

  const totalCount = filteredCards.length;
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (page - 1) * limit;

  const paginatedCards = filteredCards.slice(startIndex, startIndex + limit);

  return {
    data: paginatedCards,
    totalQuantity,
    gradeCounts,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
    },
  };
};

const galleryService = {
  getAllGalleryList,
};

export default galleryService;
