import { CardGenre, PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { cardTemplateSeedData } from './seedData.js';
import transactionRepository from '../../src/repositories/transactionRepository.js';
const prisma = new PrismaClient();

/*
  1. 시드 데이터 코드 작성
  2. npm run seed
*/

async function main() {
  // 기존 데이터 정리
  // await prisma.card.deleteMany();
  // await prisma.transaction.deleteMany();
  // await prisma.cardOwnership.deleteMany();

  // user seedData 생성 예시
  // await prisma.user.createMany({
  //   data: 데이터 ,
  // });

  // 포토 카드 생성 시드 데이터

  // const cardTemplate = await prisma.card.createMany({
  //   data: cardTemplateSeedData,
  // });

  // await prisma.cardOwnership.createMany({
  //   data: [
  //     {
  //       cardId: cardTemplate.id,
  //       ownerId: 'de414ed2-f587-41e5-8473-0267202649c6',
  //       purchasePrice: 4,
  //       status: 'IN_GALLERY',
  //     },
  //     {
  //       cardId: cardTemplate.id,
  //       ownerId: 'de414ed2-f587-41e5-8473-0267202649c6',
  //       purchasePrice: 4,
  //       status: 'IN_GALLERY',
  //     },
  //     {
  //       cardId: cardTemplate.id,
  //       ownerId: 'de414ed2-f587-41e5-8473-0267202649c6',
  //       purchasePrice: 4,
  //       status: 'IN_GALLERY',
  //     },
  //   ],
  // });
  // 시드 파일 상단에 정의
  const grades = ['COMMON', 'RARE', 'SUPER_RARE', 'LEGENDARY'];
  const genres = [
    'ALBUM',
    'CONCERT',
    'FAN_SIGN',
    'FAN_MEETING',
    'SEASON_GREETING',
    'BENEFIT',
    'MD',
    'COLLAB',
    'ETC',
  ];

  // 랜덤 요소 선택 헬퍼 함수
  const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const allOwnerships = await prisma.cardOwnership.findMany({
    where: { status: 'IN_GALLERY' },
    select: { id: true, purchasePrice: true, cardId: true, ownerId: true },
  });

  const selectedOwnerships = allOwnerships
    .sort(() => 0.5 - Math.random())
    .slice(0, 150);

  // 3. 루프를 돌며 Repository 함수 호출
  for (const ownership of selectedOwnerships) {
    // Repository의 saveTransaction 요구사항에 맞춰 데이터 구성
    const transactionData = {
      sellerId: ownership.ownerId,
      cardId: ownership.cardId,
      ownershipIds: [ownership.id], // 1장씩 판매하는 경우
      price: Math.floor(ownership.purchasePrice * 1.2),
      exchangeGrade: getRandom(grades), // 시딩 시 기본값 설정
      exchangeGenre: getRandom(genres),
      exchangeDescription: '교환 환영합니다! 편하게 연락주세요.',
    };

    // ⭐️ 작성해두신 Repository 로직 호출
    await transactionRepository.saveTransaction(transactionData);
  }

  console.log('시드 데이터 입력 완료!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
