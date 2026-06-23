# Freelance Auction Platform

## Описание проекта

Freelance Auction Platform - дипломный проект фриланс-платформы с аукционной моделью выбора исполнителя. Заказчик публикует задание, фрилансеры подают ставки, заказчик выбирает подходящую ставку, после чего создаётся контракт. Работа по контракту проходит через milestones, средства учитываются через mock escrow и mock payments, а процесс сопровождается чатом, уведомлениями, отзывами, рейтингами и административной панелью.

## Цель проекта

Цель проекта - разработать веб-приложение для взаимодействия заказчиков и исполнителей с использованием аукционной модели выбора исполнителя. Система демонстрирует полный цикл работы: от регистрации и создания задания до выбора ставки, выполнения контракта, проверки этапов, коммуникации, отзывов и администрирования.

## Основные роли

- `CLIENT` - заказчик. Может создавать задания, просматривать ставки, принимать ставку, управлять контрактами, создавать milestones, подтверждать или отклонять выполненные этапы, открывать споры и оставлять отзывы.
- `FREELANCER` - исполнитель. Может просматривать задания, подавать ставки, работать по контрактам, отправлять milestones на проверку, общаться в чате, открывать споры и оставлять отзывы.
- `ADMIN` - администратор. Может просматривать пользователей, блокировать и разблокировать аккаунты, смотреть аналитику, разбирать споры, просматривать логи и модерировать платформу.

## Основной пользовательский сценарий

1. Пользователь регистрируется или входит в систему.
2. `CLIENT` создаёт задачу.
3. `FREELANCER` подаёт ставку на открытую задачу.
4. `CLIENT` принимает одну из ставок.
5. Система создаёт контракт.
6. `FREELANCER` выполняет milestone и отправляет его на проверку.
7. `CLIENT` принимает milestone.
8. Средства mock escrow высвобождаются через mock payment.
9. Участники оставляют отзывы друг другу, рейтинг пересчитывается.
10. Уведомления и чат сопровождают процесс на ключевых этапах.

## Функциональность

- **Authentication** - регистрация, вход, JWT, protected routes.
- **Tasks** - создание, просмотр, редактирование и удаление заданий.
- **Bids / Auction** - ставки фрилансеров на задания и выбор победителя.
- **Contracts** - создание контракта после принятия ставки.
- **Milestones** - этапы выполнения контракта, submit/approve/reject workflow.
- **Escrow / Payments** - mock escrow и mock payments в базе данных.
- **Chat** - чат внутри контракта.
- **Reviews / Ratings** - отзывы после завершения контракта и пересчёт рейтинга.
- **Notifications** - уведомления по событиям платформы.
- **Disputes** - пользовательские споры по контрактам и обработка администратором.
- **Admin panel** - управление пользователями, спорами, логами и аналитикой.
- **Swagger** - документация REST API.

## Архитектура

Проект построен как модульный монолит:

- frontend React app на Vite;
- backend Express API;
- PostgreSQL database;
- Sequelize ORM и Sequelize migrations;
- Socket.IO realtime layer;
- JWT authentication;
- role-based access control;
- модульная структура backend по доменным областям.

## Структура проекта

```text
freelance-auction-platform/
  backend/
  frontend/
  docs/
  README.md
```

- `backend/` - Express API, Sequelize models/migrations, REST modules, Socket.IO, Swagger.
- `frontend/` - React/Vite приложение, страницы, layout, API-клиенты, контексты.
- `docs/` - проектная документация, сценарии демонстрации и smoke tests.
- `README.md` - основная инструкция по проекту.

## Требования

- Node.js 20+
- PostgreSQL 14+
- npm
- современный браузер

## Настройка PostgreSQL

Локальная база данных:

- Database: `freelance_db`
- User: `freelance_user`
- Password: `freelance_password`

Пример SQL:

```sql
CREATE DATABASE freelance_db;
CREATE USER freelance_user WITH PASSWORD 'freelance_password';
GRANT ALL PRIVILEGES ON DATABASE freelance_db TO freelance_user;
```

Если PostgreSQL требует отдельные права на schema `public`, выполните подключение к базе `freelance_db` и выдайте права:

```sql
GRANT ALL ON SCHEMA public TO freelance_user;
```

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run create:admin
npm run dev
```

На Windows вместо `cp` можно использовать:

```powershell
Copy-Item .env.example .env
```

Backend URL:

```text
http://localhost:5000
```

Health check:

```text
http://localhost:5000/health
```

Swagger:

```text
http://localhost:5000/api-docs
```

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

На Windows вместо `cp` можно использовать:

```powershell
Copy-Item .env.example .env
```

Frontend URL:

```text
http://localhost:5173
```

## Environment variables

Backend `.env`:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=freelance_db
DB_USER=freelance_user
DB_PASSWORD=freelance_password
DB_DIALECT=postgres
JWT_SECRET=super_secret_jwt_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Frontend `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Test users

Примерные пользователи для локальной демонстрации:

```text
CLIENT
Email: client@test.com
Password: 12345678

FREELANCER
Email: freelancer@test.com
Password: 12345678

ADMIN
Email: admin@test.com
Password: 12345678
```

Администратор создаётся командой:

```bash
npm run create:admin
```

Если seed не создаёт `CLIENT` и `FREELANCER`, их можно создать через страницу регистрации во frontend.

## Demo scenario

Краткий сценарий для защиты:

1. Login as `CLIENT`.
2. Create task.
3. Login as `FREELANCER`.
4. Submit bid.
5. Login as `CLIENT`.
6. Accept bid.
7. Open contract.
8. Submit/approve milestone.
9. Send chat message.
10. Leave review.
11. Check notifications.
12. Login as `ADMIN`.
13. Show analytics, users, disputes, logs.

Подробный сценарий находится в `docs/DEMO_SCENARIO.md`.

## API documentation

Swagger UI доступен по адресу:

```text
http://localhost:5000/api-docs
```

Краткий обзор групп API находится в `docs/API_OVERVIEW.md`.

## Realtime features

- Realtime bids работают через Socket.IO комнаты `task_<taskId>`.
- Realtime chat работает через комнаты `contract_<contractId>`.
- Realtime notifications работают через персональные комнаты `user_<userId>`.

## Security

- Пароли хэшируются перед сохранением.
- Для авторизации используется JWT.
- Доступ к backend endpoint защищается middleware.
- Frontend использует protected routes.
- Административные endpoint доступны только роли `ADMIN`.
- Заблокированные пользователи не должны проходить авторизацию.

## Notes

- Платежи реализованы как mock payments.
- Escrow является имитацией бизнес-логики и не интегрирован с реальной платёжной системой.
- Проект предназначен для дипломной демонстрации и локального запуска.
- Docker в проекте не используется.
