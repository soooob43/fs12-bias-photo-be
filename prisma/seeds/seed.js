import { CardGenre, PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { cardTemplateSeedData } from './seedData.js';
import transactionRepository from '../../src/repositories/transactionRepository.js';
import { fakerKO as faker } from '@faker-js/faker';
import { fakerEN as fakerEN } from '@faker-js/faker';
const prisma = new PrismaClient();

/*
  1. 시드 데이터 코드 작성
  2. npm run seed
*/

const grades = ['COMMON', 'RARE', 'SUPER_RARE', 'LEGENDARY'];
const genres = [
  'ALBUM',
  'BENEFIT',
  'FAN_SIGN',
  'SEASON_GREETING',
  'FAN_MEETING',
  'CONCERT',
  'MD',
  'COLLAB',
  'FAN_CLUB',
  'ETC',
];

const prefixes = [
  '미공포',
  '럭드',
  '팬싸특전',
  '시그',
  '팝업',
  '사녹',
  '위드뮤',
  '뮤직코리아',
  '한정판',
  '스페셜',
];
const themes = [
  '꿈꾸는 밤',
  '여름날의 기억',
  '차가운 새벽',
  '청량한 오후',
  '비하인드 씬',
  '눈부신 순간',
  '비밀스러운 기록',
  '첫 번째 조각',
  '너와 나만의 시간',
  '기억의 조각',
  '포근한 온도',
  '강렬한 시선',
  '부드러운 손길',
  '영원한 약속',
  '찬란한 계절',
  '우연한 만남',
  '깊은 울림',
  '작은 소망',
  '빛나는 미래',
  '아름다운 이별',
];

const postfixes = [
  '(Edition)',
  'Ver.A',
  'Ver.B',
  'Limited',
  'Concept',
  'Style',
  'Signature',
];

async function main() {
  console.log('🌱 대규모 관계형 시드 데이터 생성을 시작합니다...');
  const hashedPassword = await bcrypt.hash('a123456789!', 10);

  // ==========================================
  // 1. 유저 (User) 생성
  // ==========================================
  console.log('⏳ [1/4] 유저 1,000명 생성 중...');
  const usersToInsert = [];
  const userIds = [];

  for (let i = 1; i <= 1000; i++) {
    const userId = faker.string.uuid();
    userIds.push(userId);

    usersToInsert.push({
      id: userId,
      email: fakerEN.internet.exampleEmail({
        firstName: fakerEN.person.firstName(),
        lastName: `${fakerEN.person.lastName()}${i}`,
      }),
      nickname: `${faker.person.firstName()}${i}`,
      password: hashedPassword,
      provider: 'LOCAL',
      createdAt: faker.date.past({ years: 1 }),
    });
  }

  await prisma.user.createMany({ data: usersToInsert, skipDuplicates: true });
  console.log('✅ 유저 생성 완료!');

  // ==========================================
  // 2. 포토카드 도안 (Card) 생성
  // ==========================================
  console.log('⏳ [2/4] 포토카드 도안 2,000개 생성 중...');
  const cardsToInsert = [];

  for (let i = 1; i <= 2000; i++) {
    const prefix = prefixes[i % prefixes.length];
    const theme = themes[i % themes.length];
    const postfix = postfixes[i % postfixes.length];
    cardsToInsert.push({
      creatorId: faker.helpers.arrayElement(userIds),
      title: `${prefix} ${theme} ${postfix}`,
      imageUrl: faker.image.url({ width: 600, height: 400 }),
      description: faker.lorem.sentences(2),
      grade: faker.helpers.arrayElement(grades),
      genre: faker.helpers.arrayElement(genres),
      minimumPrice: faker.number.int({ min: 1, max: 1000 }),
      totalQuantity: faker.number.int({ min: 1, max: 10 }),
      createdAt: faker.date.recent({ days: 100 }),
    });
  }

  await prisma.card.createMany({ data: cardsToInsert, skipDuplicates: true });

  const createdCards = await prisma.card.findMany({
    select: {
      id: true,
      totalQuantity: true,
      minimumPrice: true,
      createdAt: true,
    },
  });
  console.log('✅ 포토카드 생성 완료!');

  // ==========================================
  // 3. 포토카드 소유권 (CardOwnership) 발급
  // ==========================================
  console.log('⏳ [3/4] 포토카드 소유권 배분 중...');
  const ownershipsToInsert = [];

  for (const card of createdCards) {
    for (let i = 0; i < card.totalQuantity; i++) {
      ownershipsToInsert.push({
        cardId: card.id,
        ownerId: faker.helpers.arrayElement(userIds),
        purchasePrice: card.minimumPrice,
        status: 'IN_GALLERY',
        createdAt: card.createdAt,
        updatedAt: card.createdAt,
      });
    }
  }

  await prisma.cardOwnership.createMany({
    data: ownershipsToInsert,
    skipDuplicates: true,
  });
  console.log(
    `✅ 총 ${ownershipsToInsert.length}개의 포토카드 소유권 발급 완료!`,
  );

  // ==========================================
  // 4. 마켓 거래글 (Transaction) 생성
  // ==========================================
  console.log('⏳ [4/4] 마켓 거래글 4,000개 생성 중...');
  const transactionsToInsert = [];

  for (let i = 1; i <= 4000; i++) {
    const randomCard = faker.helpers.arrayElement(createdCards);
    const totalQty = faker.number.int({
      min: 1,
      max: randomCard.totalQuantity,
    });
    const remainQty = faker.number.int({ min: 0, max: totalQty });

    transactionsToInsert.push({
      sellerId: faker.helpers.arrayElement(userIds),
      cardId: randomCard.id,
      price: faker.number.int({ min: 1, max: 1000 }),
      totalQuantity: totalQty,
      remainingQuantity: remainQty,
      exchangeGrade: faker.helpers.arrayElement(grades),
      exchangeGenre: faker.helpers.arrayElement(genres),
      exchangeDescription: faker.datatype.boolean()
        ? faker.lorem.sentence()
        : null,

      createdAt: faker.date.between({
        from: randomCard.createdAt,
        to: new Date(),
      }),
    });
  }

  await prisma.transaction.createMany({
    data: transactionsToInsert,
    skipDuplicates: true,
  });
  console.log('✅ 마켓 거래글 생성 완료!');

  console.log(
    '🎉 모든 시드 데이터가 성공적으로 데이터베이스에 입력되었습니다!',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
