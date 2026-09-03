# Cyber Safe BD Server

Backend scaffold for the `cyber-crime-bd` client application.

## Stack

- TypeScript
- Express
- Prisma
- PostgreSQL
- Better Auth

## Features Covered

- Auth-ready user/session/account schema
- Learn categories and articles
- Laws and regulations
- Verified professionals and advice
- Help requests and case messages
- Seed script for starter data

## Setup

1. Copy `.env.example` to `.env`
2. Install dependencies
3. Run `npm run prisma:generate`
4. Run `npm run prisma:migrate`
5. Run `npm run prisma:seed`
6. Run `npm run dev`

## Vercel Deployment

1. Import this repository into Vercel with the project root as the Root Directory.
2. Add `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `APP_URL` in the Vercel project environment variables. Add the Google variables if Google sign-in is enabled.
3. Deploy with the default build command: `npm run build`.
4. Apply production migrations once from a trusted environment with `npm run prisma:migrate:deploy`.

Vercel serves the Express app through `api/index.ts`; local development still uses `npm run dev`.

## API Summary

- Better Auth is mounted at `/api/auth/*`.
- Use `POST /api/auth/sign-up/email` and `POST /api/auth/sign-in/email` for email/password authentication.
- Send the returned session cookie with `credentials: "include"`; server routes can use `requireAuth` or `optionalAuth` from `src/middlewares/auth.ts` to access `req.authSession`.
- `GET /api/health`
- `GET /api/learn/categories`
- `GET /api/learn/articles`
- `GET /api/learn/articles/:id`
- `GET /api/laws`
- `GET /api/professionals`
- `GET /api/advices`
- `GET /api/help-requests`
- `GET /api/help-requests/:id`
- `GET /api/help-requests/:id/messages`
- `POST /api/help-requests`
- `POST /api/help-requests/:id/messages`
