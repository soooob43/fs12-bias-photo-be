import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  // 기존 데이터 정리
  // await prisma.user.deleteMany();

  // user seedData 생성
  // await prisma.user.createMany({
  //   data: ,
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
