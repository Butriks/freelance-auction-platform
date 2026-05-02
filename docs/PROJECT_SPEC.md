# Project Specification

## Description

Freelance Auction Platform is a diploma project for a freelance marketplace where clients publish tasks, freelancers place bids, and work is completed through contracts with milestones, mock escrow payments, reviews, and ratings.

## Stack

- Backend: Node.js, Express.js, Sequelize, PostgreSQL
- Frontend: React, Vite, React Router, Axios
- Realtime: Socket.IO
- Auth: JWT + bcrypt
- Validation: Joi
- API Docs: Swagger will be added later

## User Roles

- `CLIENT`: creates tasks, reviews bids, selects freelancers, manages contracts.
- `FREELANCER`: searches tasks, places bids, completes contract milestones.
- `ADMIN`: manages users, monitors platform activity, views analytics.

## Main Modules

- Auth and user roles
- Tasks and auctions
- Bids
- Contracts
- Contract milestones
- Mock escrow payments
- Reviews and ratings
- Contract chat
- Notifications
- Action logs
- Admin panel and analytics

## MVP

The MVP includes registration and login, role-based access, task creation, bidding, winner selection, contract creation, milestones, mock escrow state tracking, reviews, rating calculation, chat, notifications, action logs, and basic admin analytics.

