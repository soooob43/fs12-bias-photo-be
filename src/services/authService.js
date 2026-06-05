import bcrypt from 'bcrypt';
import authRepository from '../repositories/authRepository.js';

const signup = async (signupData) => {
  const existingUser = await authRepository.findByEmail(signupData.email);
  if (existingUser) {
    const error = new Error('이미 가입된 이메일입니다.');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(signupData.password, 10);
  const user = await authRepository.createUser({
    email: signupData.email,
    password: hashedPassword,
    nickname: signupData.nickname,
  });

  return user;
};

const sanitizedUser = (user) => {
  const { password, refreshToken, ...rest } = user;
  return rest;
};

const authService = {
  signup,
};

export default authService;
