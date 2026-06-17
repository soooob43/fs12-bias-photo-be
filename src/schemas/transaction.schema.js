import { CardGenre, CardGrade } from '@prisma/client';
import z from 'zod';

export const transactionSchema = z.object({
  cardId: z.number().int().positive(),
  price: z.number().int().min(1, '가격은 1 이상이어야 합니다.'),
  ownershipIds: z
    .array(z.number().int().positive())
    .min(1, '판매할 카드를 1장 이상 선택해 주세요.'),
  exchangeGrade: z.nativeEnum(CardGrade, {
    errorMap: () => ({ message: '유효하지 않은 카드 등급입니다.' }),
  }),
  exchangeGenre: z.nativeEnum(CardGenre, {
    errorMap: () => ({ message: '유효하지 않은 카드 장르입니다.' }),
  }),
  exchangeDescription: z.string().max(300).optional(),
});

export const updateTransactionSchema = z
  .object({
    price: z.number().int().min(1).optional(),
    totalQuantity: z.number().int().min(1).optional(),
    exchangeGrade: z.nativeEnum(CardGrade).optional(),
    exchangeGenre: z.nativeEnum(CardGenre).optional(),
    exchangeDescription: z.string().max(300).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: '수정할 내용을 입력해 주세요.',
  });
