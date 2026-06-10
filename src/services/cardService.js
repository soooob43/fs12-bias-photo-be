import cloudinary from '../config/cloudinary.js';
import cardRepository from '../repositories/cardRepository.js';

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

/*-------------------------
    포토 카드 생성 - 최혜성
 -------------------------*/
const createCard = async (creatorId, cardData) => {
  const { minimumPrice, totalQuantity, ...rest } = cardData;

  const newCardData = {
    ...rest,
    creatorId,
    minimumPrice: Number(minimumPrice),
    totalQuantity: Number(totalQuantity),
  };

  return await cardRepository.createCard(newCardData);
};

const cardService = { generateUploadSignature, createCard };

export default cardService;
