import { OwnershipStatus } from '@prisma/client';
import prisma from '../config/prisma.js';

/*---------------------------
 마이갤러리 조회 
  add : 2026.06.12 윤소정

  로그인 사용자가 현재 보유 중인 카드 소유권 조회
  IN_GALLERY 상태의 카드를 조회함
----------------------------*/
const findGalleryOwnerships = async (ownerId) => {
  return prisma.cardOwnership.findMany({
    where: {
      ownerId,
      status: OwnershipStatus.IN_GALLERY,
    },
    select: {
      id: true,
      purchasePrice: true,
      createdAt: true,
      card: {
        select: {
          id: true,
          title: true,
          imageUrl: true,
          description: true,
          grade: true,
          genre: true,
          minimumPrice: true,
          createdAt: true,
          creator: {
            select: {
              nickname: true,
            },
          },
        },
      },
      owner: {
        select: {
          nickname: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

const galleryRepository = {
  findGalleryOwnerships,
};

export default galleryRepository;
