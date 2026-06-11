import { CardGenre, CardGrade } from '@prisma/client';
import z from 'zod';

export const cardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, '제목을 입력해주세요.')
    .max(15, '제목은 15자 이하여야 합니다.'),
  imageUrl: z
    .string({ required_error: '이미지 URL이 필요합니다.' })
    .url('유효한 이미지 URL 형식이 아닙니다.'),
  description: z.string().max(255, '설명은 255자 이하여야 합니다.').optional(),
  grade: z.nativeEnum(CardGrade, {
    errorMap: () => ({ message: '유효하지 않은 카드 등급입니다.' }),
  }),
  genre: z.nativeEnum(CardGenre, {
    errorMap: () => ({ message: '유효하지 않은 카드 장르입니다.' }),
  }),
  minimumPrice: z
    .number({ invalid_type_error: '최소 가격은 숫자여야 합니다.' })
    .int('소수점은 입력할 수 없습니다.')
    .min(1, '최소 가격은 1P 이상이어야 합니다.'),
  totalQuantity: z
    .number({ invalid_type_error: '총 발행량은 숫자여야 합니다.' })
    .int('소수점은 입력할 수 없습니다.')
    .min(1, '총 발행량은 1장 이상이어야 합니다.')
    .max(10, '총 발행량은 10장 이하로 선택 가능합니다.'),
});
