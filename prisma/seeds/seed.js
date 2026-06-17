import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { fakerKO } from '@faker-js/faker';
import { faker as fakerEN } from '@faker-js/faker';

const prisma = new PrismaClient();

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
  console.log(
    '🌱 대규모 관계형 시드 데이터 생성을 시작합니다... (병렬 처리 최적화 버전)',
  );
  const hashedPassword = await bcrypt.hash('a123456789!', 10);

  // ==========================================
  // 1. 유저 & 포인트 생성
  // ==========================================
  console.log('⏳ [1/4] 유저 및 포인트 1,000명 생성 중...');
  const usersToInsert = [];
  const pointsToInsert = [];
  const userIds = [];

  for (let i = 1; i <= 1000; i++) {
    const userId = fakerEN.string.uuid();
    userIds.push(userId);
    const createdAt = fakerEN.date.past({ years: 1 });

    usersToInsert.push({
      id: userId,
      email: fakerEN.internet.exampleEmail({
        lastName: `${fakerEN.person.lastName()}${i}`,
      }),
      nickname: `${fakerKO.person.firstName()}${i}`,
      password: hashedPassword,
      provider: 'LOCAL',
      createdAt: createdAt,
    });

    pointsToInsert.push({
      userId: userId,
      balance: fakerEN.number.int({ min: 500, max: 50000 }),
      updatedAt: createdAt,
    });
  }

  await prisma.user.createMany({ data: usersToInsert, skipDuplicates: true });
  await prisma.userPoint.createMany({
    data: pointsToInsert,
    skipDuplicates: true,
  });

  // ==========================================
  // 2. 포토카드 도안 생성
  // ==========================================
  console.log('⏳ [2/4] 포토카드 도안 2,000개 생성 중...');
  const cardsToInsert = [];
  for (let i = 1; i <= 2000; i++) {
    cardsToInsert.push({
      creatorId: fakerEN.helpers.arrayElement(userIds),
      title: `${prefixes[i % prefixes.length]} ${themes[i % themes.length]} ${postfixes[i % postfixes.length]}`,
      imageUrl: fakerEN.image.url({ width: 600, height: 400 }),
      description: fakerEN.lorem.sentences(2),
      grade: fakerEN.helpers.arrayElement(grades),
      genre: fakerEN.helpers.arrayElement(genres),
      minimumPrice: fakerEN.number.int({ min: 1, max: 1000 }),
      totalQuantity: fakerEN.number.int({ min: 1, max: 10 }),
      createdAt: fakerEN.date.recent({ days: 100 }),
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

  // ==========================================
  // 3. 포토카드 소유권 1차 발급 (모두 IN_GALLERY 상태)
  // ==========================================
  console.log('⏳ [3/4] 포토카드 소유권 배분 중...');
  const ownershipsToInsert = [];

  for (const card of createdCards) {
    for (let i = 0; i < card.totalQuantity; i++) {
      ownershipsToInsert.push({
        cardId: card.id,
        ownerId: fakerEN.helpers.arrayElement(userIds),
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

  const allOwnerships = await prisma.cardOwnership.findMany({
    include: { card: { select: { createdAt: true } } },
  });

  const ownershipsByOwner = {};
  for (const o of allOwnerships) {
    if (!ownershipsByOwner[o.ownerId]) ownershipsByOwner[o.ownerId] = [];
    ownershipsByOwner[o.ownerId].push(o);
  }

  // ==========================================
  // 4. 거래글 연동 (Promise.all 병렬 처리)
  // ==========================================
  console.log('⏳ [4/4] 거래글 자동 생성 및 소유권 연동 (병렬 처리 중)...');

  const transactionTasks = [];

  // 처리할 작업(Task)들을 배열에 미리 정의
  for (let i = 1; i <= 4000; i++) {
    const sellerId = fakerEN.helpers.arrayElement(userIds);
    const userOwns =
      ownershipsByOwner[sellerId]?.filter((o) => o.status === 'IN_GALLERY') ||
      [];

    if (userOwns.length === 0) continue;

    const randomOwn = fakerEN.helpers.arrayElement(userOwns);
    const targetCardId = randomOwn.cardId;
    const targetOwns = userOwns.filter((o) => o.cardId === targetCardId);

    const sellQty = fakerEN.number.int({ min: 1, max: targetOwns.length });
    const selectedOwns = targetOwns.slice(0, sellQty);

    const txCreatedAt = fakerEN.date.between({
      from: randomOwn.card.createdAt,
      to: new Date(),
    });

    // 메모리 상에서 중복 판매되지 않도록 상태 임시 변경
    selectedOwns.forEach((o) => (o.status = 'ON_SALE'));

    // DB에 쏠 작업 명세서 작성
    transactionTasks.push({
      txData: {
        sellerId: sellerId,
        cardId: targetCardId,
        price: fakerEN.number.int({ min: 10, max: 10000 }),
        totalQuantity: sellQty,
        remainingQuantity: sellQty,
        exchangeGrade: fakerEN.helpers.arrayElement(grades),
        exchangeGenre: fakerEN.helpers.arrayElement(genres),
        exchangeDescription: fakerEN.datatype.boolean()
          ? fakerEN.lorem.sentence()
          : null,
        createdAt: txCreatedAt,
      },
      ownershipIds: selectedOwns.map((o) => o.id),
      txCreatedAt: txCreatedAt,
    });
  }

  // ✨ 핵심 성능 최적화: 200개씩 묶어서(Chunk) 병렬로 DB에 요청합니다.
  const CHUNK_SIZE = 5;

  for (let i = 0; i < transactionTasks.length; i += CHUNK_SIZE) {
    const chunk = transactionTasks.slice(i, i + CHUNK_SIZE);

    // 5개의 작업만 동시에 실행하여 DB 과부하를 막습니다.
    await Promise.all(
      chunk.map(async (task) => {
        const newTx = await prisma.transaction.create({
          data: task.txData,
        });

        await prisma.cardOwnership.updateMany({
          where: { id: { in: task.ownershipIds } },
          data: {
            status: 'ON_SALE',
            transactionId: newTx.id,
            updatedAt: task.txCreatedAt,
          },
        });
      }),
    );

    if ((i + CHUNK_SIZE) % 500 === 0) {
      console.log(`⏳ 마켓 거래글 ${i + CHUNK_SIZE}개 처리 완료...`);
    }
  }

  console.log(`✅ 마켓 거래글 ${transactionTasks.length}개 연동 완료!`);
  console.log(
    '🎉 DB 시퀀스 파괴 없이 모든 데이터가 초고속으로 생성되었습니다!',
  );
}

main()
  .catch((e) => {
    console.error('시드 생성 중 에러 발생:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
