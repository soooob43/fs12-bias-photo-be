import prisma from '../config/prisma.js';

const findByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

const findByNickname = async (nickname) => {
  return await prisma.user.findUnique({
    where: { nickname },
  });
};

const findById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

const createUser = async (userData) => {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        nickname: true,
        provider: true,
      },
    });
    await tx.userPoint.create({
      // 테스트를 위해 회원가입시 10만 포인트 지급
      data: { userId: user.id, balance: 100000 },
    });
    return user;
  });
};

const updateUser = async (id, data) => {
  return await prisma.user.update({
    where: {
      id,
    },
    data,
  });
};

const authRepository = {
  findByEmail,
  findByNickname,
  findById,
  createUser,
  updateUser,
};

export default authRepository;
