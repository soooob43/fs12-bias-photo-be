import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authRepository from '../repositories/authRepository.js';

const signup = async (signupData) => {
  const existingUser = await authRepository.findByEmail(signupData.email);
  if (existingUser) {
    const error = new Error('이미 가입된 이메일입니다.');
    error.statusCode = 409;
    throw error;
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

  const accessToken = generateAccessToken({ userId: user.id });
  const refreshToken = generateRefreshToken({ userId: user.id });
  await authRepository.updateUser(user.id, {
    refreshToken,
  });

  return { accessToken, refreshToken, user: sanitizeUser(user) };
};

const updateUser = async (id, data) => {
  const user = await authRepository.updateUser(id, data);
  return sanitizedUser(user);
};

const hashPassword = async (password) => {
  return bcrypt.hash(password, 10);
};

const comparePassword = async (inputPassword, hashPassword) => {
  return bcrypt.compare(inputPassword, hashPassword);
};

const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30m',
  });
};
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '2w',
  });
};

const userProfileResponse = (user) => {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    points: user.point.balance,
    provider: user.provider,
  };
};

const authService = {
  signup,
  login,
};

export default authService;
