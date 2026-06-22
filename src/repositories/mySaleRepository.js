import prisma from '../config/prisma.js';

export const findMySales = async ({ where, skip, take }) => {
  return prisma.transaction.findMany({
    where,
    skip,
    take,
    include: {
      card: {
        include: {
          creator: {
            select: {
              nickname: true,
            },
          },
        },
      },

      exchangeOffers: {
        where: {
          isDeleted: false,
        },
      },
    },

    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const countMySales = async (where) => {
  return prisma.transaction.count({ where });
};
