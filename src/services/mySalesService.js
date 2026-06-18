import mySalesRepository from '../repositories/mySalesRepository.js';

import {
  toMySaleResponse,
  toMyOfferResponse,
} from '../mappers/mySaleMapper.js';

export const getMySales = async (params) => {
  const { sellerId, page, limit, saleMethod } = params;

  /* ----------------
      전체 통계 조회
   ------------------*/
  // 등급별 갯수 (품절 제외)
  const gradeCounts = await mySalesRepository.getMyCardGradeCounts(sellerId);
  // 잔여 수량 총합
  const totalQuantity = Object.values(gradeCounts).reduce((a, b) => a + b, 0);

  /* --------------------------------
     검색 조건에 맞는 포인터 병렬 조회
   --------------------------------*/
  const [salePointers, exchangePointers] = await Promise.all([
    saleMethod !== 'EXCHANGE'
      ? mySalesRepository.findMySaleIds(sellerId, params)
      : [],
    saleMethod !== 'SALE'
      ? mySalesRepository.findMyExchangeOfferIds(sellerId, params)
      : [],
  ]);

  // type 태깅후 최신순으로 정렬
  const combinedPointers = [
    ...salePointers.map((p) => ({
      id: p.id,
      createdAt: p.createdAt.getTime(),
      type: 'SALE',
    })),
    ...exchangePointers.map((p) => ({
      id: p.id,
      createdAt: p.createdAt.getTime(),
      type: 'EXCHANGE',
    })),
  ].sort((a, b) => b.createdAt - a.createdAt);

  /* ---------------
      페이지네이션 
   ----------------*/
  const totalCount = combinedPointers.length;
  const skip = (page - 1) * limit;
  const paginatedPointers = combinedPointers.slice(skip, skip + limit);

  const saleIds = paginatedPointers
    .filter((p) => p.type === 'SALE')
    .map((p) => p.id);
  const exchangeIds = paginatedPointers
    .filter((p) => p.type === 'EXCHANGE')
    .map((p) => p.id);

  const [sales, offers] = await Promise.all([
    saleIds.length > 0 ? mySalesRepository.findMySales(saleIds) : [],
    exchangeIds.length > 0
      ? mySalesRepository.findMyExchangeOffers(exchangeIds)
      : [],
  ]);

  const dataMap = new Map();

  // 조회된 데이터 매핑
  sales.forEach((sale) =>
    dataMap.set(`SALE-${sale.id}`, toMySaleResponse(sale)),
  );
  offers.forEach((offer) =>
    dataMap.set(`EXCHANGE-${offer.id}`, toMyOfferResponse(offer)),
  );

  // 원본 포인터의 정렬 순서대로 Map에서 값을 꺼내어 최종 배열 완성
  const paginatedData = paginatedPointers.map((p) =>
    dataMap.get(`${p.type}-${p.id}`),
  );

  return {
    data: paginatedData,
    gradeCounts,
    totalQuantity,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
    },
  };
};

const mySalesService = {
  getMySales,
};

export default mySalesService;
