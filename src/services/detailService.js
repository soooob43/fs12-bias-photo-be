import detailRepository from '../repositories/detailRepository.js';

const getPhotocard = async (transactionId) => {
  const photocard = await detailRepository.getMarketDetail(transactionId);

  //해당 ID 포토카드 판매 정보가 없는 경우
  if (!photocard) {
    throw new Error('해당 포토카드의 판매 정보를 찾을 수 없습니다.');
  }

  return photocard;
};

export default {
  getPhotocard,
};
