import { CardGenre, PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
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

  // const cardTemplate = await prisma.card.create({
  //   data: {
  //     creatorId: 'beb74e7b-2bcf-4591-b7fe-1e93ff0f7a82',
  //     title: '테스트용 포토카드',
  //     imageUrl:
  //       'https://marketplace.canva.com/MADAHLN-YEY/1/thumbnail_large-1/canva-puppy-MADAHLN-YEY.jpg',
  //     description: '테스트용 강아지 이미지 입니다!',
  //     grade: 'LEGENDARY',
  //     genre: CardGenre.SEASON_GREETING,
  //     minimumPrice: 10,
  //     totalQuantity: 3,
  //   },
  // });

  // await prisma.cardOwnership.createMany({
  //   data: [
  //     {
  //       cardId: cardTemplate.id,
  //       ownerId: 'beb74e7b-2bcf-4591-b7fe-1e93ff0f7a82',
  //       purchasePrice: 10,
  //       status: 'IN_GALLERY',
  //     },
  //     {
  //       cardId: cardTemplate.id,
  //       ownerId: 'beb74e7b-2bcf-4591-b7fe-1e93ff0f7a82',
  //       purchasePrice: 10,
  //       status: 'IN_GALLERY',
  //     },
  //     {
  //       cardId: cardTemplate.id,
  //       ownerId: 'beb74e7b-2bcf-4591-b7fe-1e93ff0f7a82',
  //       purchasePrice: 10,
  //       status: 'IN_GALLERY',
  //     },
  //   ],
  // });

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
