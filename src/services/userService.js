import userRepository from '../repositories/userRepository.js';

const getMe = async (id) => {
  const user = await userRepository.findUserProfile(id);
  if (!user) {
    const error = new Error('사용자를 찾을 수 없습니다.');
    error.statusCode = 404;
    throw error;
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
