import prisma from "../config/prisma.js";

export const findMySales = async ({
  sellerId,
}) => {
  return prisma.transaction.findMany({
    where: {
      sellerId,
      isDeleted: false,
    },

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
      createdAt: "desc",
    },
  });
};