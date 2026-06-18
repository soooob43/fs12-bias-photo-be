import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import authRepository from '../repositories/authRepository.js';
import AppError from '../utils/appError.js';

const GOOGLE_CALLBACK_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://fs12-bias-photo-be.onrender.com/auth/google/callback'
    : `http://localhost:${process.env.PORT}/auth/google/callback`;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await authRepository.findByEmail(email);

        if (user) {
          if (user.provider === 'LOCAL') {
            return done(
              AppError(
                409,
                'ALREADY_REGISTERED_LOCAL',
                '일반 로그인으로 가입된 계정입니다.',
              ),
            );
          }
        } else {
          user = await authRepository.createUser({
            email,
            nickname: profile.displayName,
            provider: 'GOOGLE',
            providerId: profile.id,
          });
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    },
  ),
);
