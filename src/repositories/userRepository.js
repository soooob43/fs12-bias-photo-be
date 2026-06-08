import prisma from '../config/prisma.js';

const findUserProfile = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      nickname: true,
      provider: true,
      point: {
        select: { balance: true },
      },
    },
  });
};

const userRepository = {
  findUserProfile,
};

export default userRepository;
