import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

/*
  1. 시드 데이터 코드 작성
  2. npm run seed
*/

async function main() {
  // 기존 데이터 정리
  // await prisma.user.deleteMany();

  // user seedData 생성 예시
  // await prisma.user.createMany({
  //   data: 데이터 ,
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
