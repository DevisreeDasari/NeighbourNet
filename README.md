# NeighbourNet

Hyperlocal skills exchange platform where neighbours trade time and skills using a credit system:

- 1 hour given = 1 NeighbourCoin earned
- 1 hour received = 1 NeighbourCoin spent

## Tech stack

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS + Framer Motion
- Backend: Node.js + Express
- DB: PostgreSQL + Prisma
- Auth: JWT access + refresh tokens (email + OTP login)
- Maps: Leaflet.js
- Realtime: Socket.io
- Uploads: Multer (local storage for dev, S3-ready)
- State: Zustand

## Setup

1. Install deps

```bash
npm install
```

2. Create `.env` files

- Copy `.env.example` to `apps/api/.env` and fill in values

3. Database

```bash
npm run db:migrate
npm run db:seed
```

4. Run dev

```bash
npm run dev
```

## API summary

- Auth: `/api/auth/*`
- Users: `/api/users/*`
- Skills: `/api/skills/*`
- Bookings: `/api/bookings/*`
- Messages: `/api/conversations/*`
- Wallet: `/api/wallet/*`
- Notifications: `/api/notifications/*`
- Leaderboard: `/api/leaderboard`

## Screenshots

- Coming soon
