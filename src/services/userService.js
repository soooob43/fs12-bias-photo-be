import userRepository from '../repositories/userRepository.js';
import AppError from '../utils/appError.js';

const getMe = async (id) => {
  const user = await userRepository.findUserProfile(id);
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', '사용자를 찾을 수 없습니다.');
  }

  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    provider: user.provider,
    points: user.point.balance,
  };
};

const userService = { getMe };
export default userService;
