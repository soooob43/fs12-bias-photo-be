export const toMySaleResponse = (sale) => ({
  transactionId: sale.id,
  title: sale.card.title,
  imageUrl: sale.card.imageUrl,
  grade: sale.card.grade,
  genre: sale.card.genre,
  creatorNickname: sale.card.creator.nickname,
  price: sale.price,
  remainingQuantity: sale.remainingQuantity,
  status: sale.remainingQuantity === 0 ? 'SOLD_OUT' : 'ON_SALE',
  createdAt: sale.createdAt.getTime(),
});

export const toMyOfferResponse = (offer) => ({
  transactionId: offer.listingId,
  title: offer.offeredCard.card.title,
  imageUrl: offer.offeredCard.card.imageUrl,
  grade: offer.offeredCard.card.grade,
  genre: offer.offeredCard.card.genre,
  creatorNickname: offer.offeredCard.card.creator.nickname,
  price: offer.offeredCard.card.minimumPrice,
  remainingQuantity: offer.isDeleted ? 0 : 1,
  status: offer.isDeleted ? 'SOLD_OUT' : 'ON_EXCHANGE',
  createdAt: offer.createdAt.getTime(),
});
