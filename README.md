## PostIt · Micro-blog with Next.js 15, NextAuth, Prisma, React Query & Tailwind

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.18-2D3748?logo=prisma)](https://www.prisma.io/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-v5-FF4154)](https://tanstack.com/query)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

A minimal micro-blog: sign in with Google, create posts, and comment.

## Features

- 🔐 **Google OAuth** (NextAuth v4, JWT sessions)
- 🗃️ **Prisma + PostgreSQL** (User / Post / Comment models)
- ⚡ **React Query v5** for fetching & caching
- 🎨 **Tailwind CSS v4** with PostCSS plugin
- 🖼️ **Next/Image** remote patterns for avatar hosts
- ✅ **TypeScript** with strict types for API and UI
- ♻️ Clean **Prisma client singleton** for dev HMR

## Stack
- **Next.js 15** (App Router UI) + **Pages API** (NextAuth v4)
- **NextAuth v4** + **@next-auth/prisma-adapter**
- **Prisma 6** + **PostgreSQL**
- **@tanstack/react-query v5**
- **Tailwind CSS v4**
- **TypeScript**

## 1 Clone & install
```bash
git clone https://github.com/ChiosDim/PostIt.git
cd postit
npm i
```

## 2 Create .env.local (do not commit):
```bash
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=YOUR_LONG_RANDOM_STRING

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

Prisma:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

Run:
```bash
npm run dev
# App: http://localhost:3000
# Session check: http://localhost:3000/api/auth/session
```

Scripts
```bash
npm run dev       # dev server (Turbopack)
npm run build     # production build
npm start         # start production build
```
