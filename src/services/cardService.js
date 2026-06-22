import dayjs from '../config/dayjs.js';
import cloudinary from '../config/cloudinary.js';
import cardRepository from '../repositories/cardRepository.js';
import AppError from '../utils/appError.js';

/*----------------------------------------------
  Cloudinary 업로드용 서명(Signature) 발급 - 최혜성
 -----------------------------------------------*/
const generateUploadSignature = () => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const folder = 'bias-photo-cards'; // 저장할 폴더명

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET,
  );

  return {
    timestamp,
    signature,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
};

// 포토 카드 월 제한 수
export const CREATE_LIMIT_PER_MONTH = 3;

/*-------------------------
    포토 카드 생성 - 최혜성
 -------------------------*/
const createCard = async (creatorId, cardData) => {
  const { minimumPrice, totalQuantity, imagePublicId, ...rest } = cardData;

  const now = dayjs();

  const startOfMonth = now.startOf('month').toDate();
  const startOfNextMonth = now.add(1, 'month').startOf('month').toDate();

  const currentMonthCount = await cardRepository.countCardsByMonth(
    creatorId,
    startOfMonth,
    startOfNextMonth,
  );

  // 이번 달 포토 카드 생성 제한 검사
  if (currentMonthCount >= CREATE_LIMIT_PER_MONTH) {
    throw AppError(403, '이번 달 포토카드 생성 한도를 초과했습니다.');
  }

  const newCardData = {
    ...rest,
    creatorId,
    minimumPrice: Number(minimumPrice),
    totalQuantity: Number(totalQuantity),
  };

  // DB 저장 실패 시, cloudinary 서버에 이미지가 쌓이는 것을 방지
  try {
    const newCard = await cardRepository.createCard(newCardData);
    return newCard;
  } catch (error) {
    if (imagePublicId) {
      cloudinary.uploader.destroy(imagePublicId).catch((cloudinaryError) => {
        console.error(
          '클라우디너리 백그라운드 이미지 삭제 실패:',
          cloudinaryError,
        );
      });
    }
    throw error;
  }
};

/*----------------------------------------
    포토 카드 생성 남은 횟수 조회 - 최혜성
 -----------------------------------------*/
const getRemainingCreateCount = async (userId) => {
  const now = dayjs();
  const startOfMonth = now.startOf('month').toDate();
  const startOfNextMonth = now.add(1, 'month').startOf('month').toDate();

  const currentMonthCount = await cardRepository.countCardsByMonth(
    userId,
    startOfMonth,
    startOfNextMonth,
  );

  const remainingCount = Math.max(
    0,
    CREATE_LIMIT_PER_MONTH - currentMonthCount,
  );

  return {
    totalLimit: CREATE_LIMIT_PER_MONTH,
    currentCount: currentMonthCount,
    remainingCount: remainingCount,
  };
};

const cardService = {
  generateUploadSignature,
  createCard,
  getRemainingCreateCount,
};

export default cardService;
