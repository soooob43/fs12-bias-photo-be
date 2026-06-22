# Bias Photo BE

> 최애 포토카드를 생성하고, 마켓플레이스에서 구매/판매/교환할 수 있는 포토카드 거래 서비스의 백엔드 API 서버입니다.  
> 프로젝트 기간: 2026.06.01 ~ 2026.06.24

## 배포 주소

- Frontend: https://fs12-bias-photo-fe.vercel.app/
- Backend: https://fs12-bias-photo-be.onrender.com

## 팀 구성

팀장: 최혜성
- 김남진
- 신영미
- 윤소정
- 이지연
- 한희나

## Tech Stack

- Node.js
- Express
- PostgreSQL
- Prisma
- JWT
- Passport Google OAuth
- Cloudinary
- Zod
- SSE

## 프로젝트 소개

사용자가 직접 포토카드를 생성하고, 보유한 포토카드를 판매하거나 다른 사용자와 교환할 수 있도록 지원하는 REST API 서버입니다.

- 이메일/Google OAuth 기반 인증
- Access Token 및 Refresh Token 기반 로그인 유지
- 포토카드 생성 및 Cloudinary 이미지 업로드 서명 발급
- 마이 갤러리, 판매 등록, 마켓플레이스 목록/상세 조회
- 포토카드 구매, 판매 취소, 교환 제안/수락/거절
- 포인트 랜덤 박스
- SSE 기반 실시간 알림

## 주요 기능

### 인증

- 회원가입, 로그인, 로그아웃
- Access Token 재발급
- Google OAuth 로그인
- HttpOnly Cookie 기반 Refresh Token 관리
- 로그인 사용자 정보 조회

### 포토카드

- 포토카드 생성
- 월별 생성 가능 개수 조회
- Cloudinary 업로드 서명 발급
- 카드 등급/장르/키워드 기반 검색

### 마켓플레이스

- 판매 중인 포토카드 목록 조회
- 커서 기반 페이지네이션
- 키워드, 등급, 장르, 판매 상태 필터
- 가격/최신순 정렬
- 판매 상세 조회
- 구매 처리

### 판매 관리

- 판매 가능한 보유 카드 조회
- 판매 등록
- 판매글 수정
- 판매글 삭제 처리
- 나의 판매 포토카드 목록 조회

### 교환

- 교환 제안 등록
- 교환 제안 목록 조회
- 교환 제안 수락
- 교환 제안 취소/거절
- 교환 관련 알림 생성

### 알림 및 포인트

- SSE 실시간 알림 스트림
- 알림 목록 조회
- 읽지 않은 알림 개수 조회
- 알림 읽음 처리
- 랜덤 포인트 뽑기

## 프로젝트 구조

```text
src
├─ app.js
├─ config
│  ├─ cloudinary.js
│  ├─ dayjs.js
│  ├─ env.js
│  ├─ passport.js
│  └─ prisma.js
├─ controllers
│  ├─ authController.js
│  ├─ cardController.js
│  ├─ detailController.js
│  ├─ galleryController.js
│  ├─ healthController.js
│  ├─ mySaleController.js
│  ├─ notificationController.js
│  ├─ pointsController.js
│  ├─ transactionController.js
│  └─ userController.js
├─ middlewares
│  ├─ auth.js
│  ├─ errorHandler.js
│  ├─ notFoundHandler.js
│  └─ validate.js
├─ repositories
├─ schemas
├─ services
└─ utils

prisma
├─ migrations
├─ seeds
└─ schema.prisma
```

## ERD

주요 테이블은 다음과 같습니다.

- `users`: 사용자 정보
- `cards`: 포토카드 원본 정보
- `card_ownerships`: 사용자별 보유 포토카드
- `transactions`: 판매 등록 정보
- `exchange_offers`: 교환 제안
- `notifications`: 알림
- `user_points`: 사용자 현재 포인트
- `points_histories`: 포인트 변경 내역
- `random_boxes`: 랜덤 박스 사용 내역
- `transaction_histories`: 거래/교환 이력

## API Endpoints

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| GET | `/health` | 서버 상태 확인 | - |
| POST | `/auth/signup` | 회원가입 | - |
| POST | `/auth/login` | 로그인 | - |
| POST | `/auth/refresh` | Access Token 재발급 | Refresh Token |
| POST | `/auth/logout` | 로그아웃 | Refresh Token |
| GET | `/auth/google` | Google OAuth 로그인 시작 | - |
| GET | `/auth/google/callback` | Google OAuth 콜백 | - |
| GET | `/users/me` | 내 정보 조회 | Access Token |
| GET | `/cards/upload-signature` | Cloudinary 업로드 서명 발급 | Access Token |
| POST | `/cards` | 포토카드 생성 | Access Token |
| GET | `/cards/remaining-count` | 포토카드 생성 가능 개수 조회 | Access Token |
| GET | `/transactions` | 마켓 판매 목록 조회 | - |
| GET | `/transactions/meta` | 마켓 필터 메타데이터 조회 | - |
| GET | `/transactions/available-cards` | 판매/교환 가능한 보유 카드 조회 | Access Token |
| POST | `/transactions` | 판매 등록 | Access Token |
| PATCH | `/transactions/:transactionId` | 판매글 수정 | Access Token |
| GET | `/market/:transactionId` | 판매 상세 조회 | - |
| POST | `/market/:transactionId/purchase` | 포토카드 구매 | Access Token |
| POST | `/market/:transactionId/exchange` | 교환 제안 등록 | - |
| GET | `/market/:transactionId/exchange` | 교환 제안 목록 조회 | - |
| PATCH | `/market/:transactionId/exchange` | 교환 제안 수락 | Access Token |
| DELETE | `/market/exchange/:exchangeOfferId` | 교환 제안 취소/거절 | Access Token |
| DELETE | `/market/:transactionId` | 판매글 삭제 | Access Token |
| GET | `/gallery` | 마이 갤러리 조회 | Access Token |
| GET | `/my-sales` | 나의 판매 포토카드 조회 | Access Token |
| GET | `/notifications` | 알림 목록 조회 | Access Token |
| GET | `/notifications/unread-count` | 읽지 않은 알림 개수 조회 | Access Token |
| GET | `/notifications/stream` | SSE 알림 스트림 연결 | Query Token |
| PATCH | `/notifications/:id/read` | 알림 단건 읽음 처리 | Access Token |
| PATCH | `/notifications/read` | 알림 일괄 읽음 처리 | Access Token |
| POST | `/points/draw` | 랜덤 포인트 뽑기 | Access Token |

## 실행 방법

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 `.env.sample`을 참고해 값을 입력합니다.

```bash
NODE_ENV=development
PORT=3001
LOCAL_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/bias_photo?schema=public"
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
### 3. 시스템 아키텍처
<img width="1571" height="962" alt="중급프로젝트_4팀_아키텍처" src="https://github.com/user-attachments/assets/78b189f0-1559-4ba2-8f83-492dc91c809a" />

### 4. Prisma Client 생성

```bash
npm run prisma:generate
```

### 5. 데이터베이스 마이그레이션

```bash
npm run prisma:migrate
```

### 6. 개발 서버 실행

```bash
npm run dev
```

기본 실행 주소는 `http://localhost:3001`입니다.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Nodemon으로 개발 서버 실행 |
| `npm start` | 프로덕션 서버 실행 |
| `npm run prisma:generate` | Prisma Client 생성 |
| `npm run prisma:migrate` | Prisma 마이그레이션 실행 |
| `npm run prisma:studio` | Prisma Studio 실행 |
| `npm run seed` | 시드 데이터 생성 |
| `npm run format` | Prettier 포맷팅 |

## Branch Strategy

- `main`: 배포 가능한 안정 버전
- `dev`: 공동 개발 브랜치
- `feature/*`: 기능 단위 개발 브랜치
