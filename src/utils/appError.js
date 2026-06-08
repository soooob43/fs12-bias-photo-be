/*---------------------------------
    커스텀 에러 함수 구현 - 최혜성

    ex) throw AppError(404, 'CARD_NOT_FOUND', '일부 카드를 찾을 수 없습니다.');
----------------------------------*/
const AppError = (statusCode, errorCode, message) => {
  const error = new Error(message);

  error.statusCode = statusCode;
  error.errorCode = errorCode;
  error.isAppError = true;

  Error.captureStackTrace(error, AppError);

  return error;
};

export default AppError;
