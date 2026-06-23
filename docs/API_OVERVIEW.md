# API Overview

Краткий обзор backend API. Полная интерактивная документация доступна в Swagger:

```text
http://localhost:5000/api-docs
```

## Auth

Группа отвечает за регистрацию, вход и получение текущего пользователя.

- `POST /api/auth/register` - регистрация `CLIENT` или `FREELANCER`.
- `POST /api/auth/login` - вход и получение JWT.
- `GET /api/auth/me` - получение текущего пользователя по JWT.

## Tasks

Группа для работы с заданиями.

- `POST /api/tasks` - создание задания, доступно `CLIENT`.
- `GET /api/tasks` - список заданий с фильтрами.
- `GET /api/tasks/:id` - детали задания.
- `PATCH /api/tasks/:id` - редактирование задания владельцем.
- `DELETE /api/tasks/:id` - удаление открытого задания владельцем.

## Bids

Группа для аукционных ставок по задачам.

- `POST /api/tasks/:taskId/bids` - создание ставки, доступно `FREELANCER`.
- `GET /api/tasks/:taskId/bids` - список ставок по задаче.

При создании ставки backend отправляет Socket.IO событие `new_bid` в комнату `task_<taskId>`.

## Contracts

Группа для выбора победителя и просмотра контрактов.

- `POST /api/tasks/:taskId/accept-bid/:bidId` - принятие ставки и создание контракта.
- `GET /api/contracts/my` - контракты текущего пользователя.
- `GET /api/contracts/:id` - детали контракта.

## Milestones

Группа для этапов выполнения контракта.

- `GET /api/contracts/:contractId/milestones` - milestones контракта.
- `POST /api/contracts/:contractId/milestones` - создание milestone заказчиком.
- `PATCH /api/milestones/:id/submit` - отправка milestone исполнителем.
- `PATCH /api/milestones/:id/approve` - подтверждение milestone заказчиком.
- `PATCH /api/milestones/:id/reject` - отклонение milestone заказчиком.

Подтверждение milestone создаёт mock payment release и может завершить contract.

## Reviews

Группа для отзывов и рейтингов.

- `POST /api/contracts/:contractId/reviews` - создание отзыва после завершения контракта.
- `GET /api/contracts/:contractId/reviews` - отзывы по контракту.
- `GET /api/users/:userId/reviews` - отзывы, полученные пользователем.

После создания review backend пересчитывает рейтинг профиля получателя.

## Messages

Группа для contract chat.

- `GET /api/contracts/:contractId/messages` - сообщения по контракту.
- `POST /api/contracts/:contractId/messages` - отправка сообщения.

После отправки сообщения backend отправляет Socket.IO событие `new_message` в комнату `contract_<contractId>`.

## Notifications

Группа для пользовательских уведомлений.

- `GET /api/notifications` - список уведомлений текущего пользователя.
- `GET /api/notifications/unread-count` - количество непрочитанных уведомлений.
- `PATCH /api/notifications/:id/read` - отметить уведомление прочитанным.
- `PATCH /api/notifications/read-all` - отметить все уведомления прочитанными.

Новые уведомления могут приходить через Socket.IO событие `notification_created` в комнате `user_<userId>`.

## Disputes

Группа для пользовательских споров по контрактам.

- `POST /api/contracts/:contractId/disputes` - создание dispute участником контракта.
- `GET /api/disputes/my` - споры текущего `CLIENT` или `FREELANCER`.

Администратор обрабатывает споры через admin API.

## Admin

Группа доступна только роли `ADMIN`.

- `GET /api/admin/users` - список пользователей.
- `PATCH /api/admin/users/:id/block` - блокировка пользователя.
- `PATCH /api/admin/users/:id/unblock` - разблокировка пользователя.
- `GET /api/admin/tasks` - список задач для администратора.
- `GET /api/admin/contracts` - список контрактов для администратора.
- `GET /api/admin/disputes` - список споров.
- `PATCH /api/admin/disputes/:id/resolve` - resolve/reject dispute.
- `GET /api/admin/logs` - журнал действий.
- `GET /api/admin/analytics` - агрегированная аналитика платформы.

## Realtime rooms

- `task_<taskId>` - realtime bids.
- `contract_<contractId>` - realtime chat.
- `user_<userId>` - realtime notifications.
