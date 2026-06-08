function errorHandler(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    // 토큰 없음
    if (err.code === 'credentials_required') {
      return res.status(401).json({
        message: '인증이 필요합니다.',
      });
    }

    // 토큰 만료
    if (
      err.code === 'invalid_token' &&
      err.inner?.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({
        message: '토큰이 만료되었습니다.',
      });
    }

    // 위조/변조/잘못된 토큰
    return res.status(401).json({
      message: '유효하지 않은 토큰입니다.',
    });
  }
  const statusCode = err.statusCode || err.status || 500;

  res.status(statusCode).json({
    message: err.message || 'Internal server error',
  });
}

export { errorHandler };
