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
  //     creatorId: 'de414ed2-f587-41e5-8473-0267202649c6',
  //     title: '강아지 포토카드',
  //     imageUrl:
  //       'https://marketplace.canva.com/MADAHLN-YEY/1/thumbnail_large-1/canva-puppy-MADAHLN-YEY.jpg',
  //     description: '강아지 이미지 입니다!',
  //     grade: 'SUPER_RARE',
  //     genre: CardGenre.CONCERT,
  //     minimumPrice: 4,
  //     totalQuantity: 3,
  //   },
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
