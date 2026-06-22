import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authRepository from '../repositories/authRepository.js';
import AppError from '../utils/appError.js';
import { Provider } from '@prisma/client';

const signup = async (signupData) => {
  const existingUser = await authRepository.findByEmail(signupData.email);
  if (existingUser) {
    throw AppError(409, 'EMAIL_ALREADY_EXISTS', '이미 가입된 이메일입니다.');
  }

  const existingNickname = await authRepository.findByNickname(
    signupData.nickname,
  );
  if (existingNickname) {
    throw AppError(
      409,
      'NICKNAME_ALREADY_EXISTS',
      '중복된 닉네임이 존재합니다.',
    );
  }

  const hashedPassword = await hashPassword(signupData.password);
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
    throw AppError(
      401,
      'INVALID_CREDENTIALS',
      '이메일 또는 비밀번호가 올바르지 않습니다.',
    );
  }

  if (user.provider === 'GOOGLE') {
    throw AppError(409, 'GOOGLE_ACCOUNT', '구글 로그인으로 가입된 계정입니다.');
  }

  const isMatch = await comparePassword(loginData.password, user.password);
  if (!isMatch) {
    throw AppError(
      401,
      'INVALID_CREDENTIALS',
      '이메일 또는 비밀번호가 올바르지 않습니다.',
    );
  }

  const accessToken = generateAccessToken({ userId: user.id });
  const refreshToken = generateRefreshToken({ userId: user.id });
  await authRepository.updateUser(user.id, {
    refreshToken,
  });

  return { accessToken, refreshToken };
};

const refresh = async (userId, refreshToken) => {
  const user = await authRepository.findById(userId);

  if (!user || user.refreshToken !== refreshToken) {
    throw AppError(401, 'INVALID_TOKEN', '유효하지 않은 토큰입니다.');
  }

  const newAccessToken = generateAccessToken({ userId });
  const newRefreshToken = generateRefreshToken({ userId });
  await authRepository.updateUser(userId, { refreshToken: newRefreshToken });

  return { newAccessToken, newRefreshToken };
};

const logout = async (userId) => {
  await authRepository.updateUser(userId, { refreshToken: null });
};

const googleLogin = async (userId) => {
  const accessToken = generateAccessToken({ userId });
  const refreshToken = generateRefreshToken({ userId });

  await authRepository.updateUser(userId, { refreshToken });

  return { accessToken, refreshToken };
};

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const comparePassword = async (inputPassword, hashPassword) => {
  return bcrypt.compare(inputPassword, hashPassword);
};

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: '30m',
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '2w',
  });
};

const authService = {
  signup,
  login,
  refresh,
  logout,
  googleLogin,
};

export default authService;
