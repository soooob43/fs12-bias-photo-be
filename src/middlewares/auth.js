import { expressjwt } from 'express-jwt';

export const verifyAccessToken = expressjwt({
  secret: process.env.JWT_ACCESS_SECRET,
  algorithms: ['HS256'],
});
export const verifyRefreshToken = expressjwt({
  secret: process.env.JWT_REFRESH_SECRET,
  algorithms: ['HS256'],
  getToken: (req) => req.cookies.refreshToken,
});
