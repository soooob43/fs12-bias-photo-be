import { OwnershipStatus } from '@prisma/client';
import transactionRepository from '../repositories/transactionRepository.js';
import prisma from '../config/prisma.js';
import AppError from '../utils/appError.js';

/* 회원별 마이갤러리 목록 조회
 ** ownerships 테이블 조회(owner_id)
 ** 현재 상태가 IN_GALLERY인 경우만 조회
 ** group으로 card id 묶어주는 작업 필요 -> 협의 후 findAvailableCardOwnerships 함수 로직 수정(조건 추가) or 별도 함수 추가 예정
 ** 검색, 필터, 페이지네이션 추가 작업 진행중
 */
const getAllGalleryList = async (userId) => {
  const ownerships =
    await transactionRepository.findAvailableCardOwnerships(userId);

  return ownerships;
};

const galleryService = {
  getAllGalleryList,
};

export default galleryService;
