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

const login = async (loginData) => {
  const user = await authRepository.findByEmail(loginData.email);
  if (!user) {
    const error = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await comparePassword(loginData.password, user.password);
  if (!isMatch) {
    const error = new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    error.statusCode = 401;
    throw error;
  }
};

const comparePassword = async (inputPassword, hashPassword) => {
  return bcrypt.compare(inputPassword, hashPassword);
};

const createToken;

const sanitizedUser = (user) => {
  const { password, refreshToken, ...rest } = user;
  return rest;
};

const authService = {
  signup,
  login,
};

export default authService;
