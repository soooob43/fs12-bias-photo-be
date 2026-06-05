import prisma from '../config/prisma.js';

const findByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
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
      data: { userId: user.id },
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
  createUser,
  updateUser,
};

export default authRepository;
