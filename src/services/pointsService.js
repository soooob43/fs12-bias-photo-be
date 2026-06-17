import authRepository from '../repositories/authRepository';
import pointsRepository from '../repositories/pointsRepository';
import AppError from '../utils/appError';

const ONE_HOUR = 60 * 60 * 1000;

const drawRandomPoint = async (userId) => {
  const latestRandomBox =
    await pointsRepository.findLatestRandomBoxByUserId(userId);

  if (latestRandomBox) {
    const diff = Date.now() - latestRandomBox.lastOpenedAt.getTime();

    if (diff < ONE_HOUR) {
      throw AppError(
        409,
        'RANDOM_BOX_NOT_AVAILABLE',
        '1시간 후 다시 시도해주세요.',
      );
    }
  }

  const drawPoint = Math.floor(Math.random() * 41) + 10;

  const randomBox = await pointsRepository.drawRandomBox(userId, drawPoint);

  const nextAvailableAt = new Date(randomBox.lastOpenedAt.getTime() + ONE_HOUR);

  return { earnedPoints: drawPoint, nextAvailableAt };
};

const pointsService = { drawRandomPoint };

export default pointsService;
