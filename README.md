# Bias Photo BE

FS12 intermediate project backend.

## Tech Stack

- Node.js
- Express
- PostgreSQL
- Prisma

## Getting Started

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
copy .env.sample .env
```

Run the development server:

```bash
npm run dev
```

## Scripts

```bash
npm run dev
npm start
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

## Branch Strategy

- `main`: production-ready branch
- `dev`: shared development branch
- `feature/*`: feature branches created from `dev`
