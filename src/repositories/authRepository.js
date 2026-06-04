import prisma from '../config/prisma.js';

const findByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

const createUser = async (userData) => {
  return await prisma.user.create({
    data: userData,
    select: {
      id: true,
      email: true,
      nickname: true,
      provider: true,
    },
  });
};

const authRepository = {
  findByEmail,
  createUser,
};

export default authRepository;
