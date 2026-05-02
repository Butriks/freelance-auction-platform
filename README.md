# Freelance Auction Platform

Diploma project: a freelance platform with task auctions, contracts, mock escrow payments, reviews, ratings, chat, notifications, action logs, and admin analytics.

## Tech Stack

- Backend: Node.js, Express.js, Sequelize, PostgreSQL
- Frontend: React, Vite, React Router, Axios
- Realtime: Socket.IO
- Auth: JWT + bcrypt
- Validation: Joi

## Project Structure

```text
backend/
frontend/
docs/
```

## Getting Started

### Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

The backend runs on `http://localhost:5000` by default.

Health check:

```bash
GET http://localhost:5000/health
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

