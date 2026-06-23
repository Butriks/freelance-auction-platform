# Smoke Test

Короткий checklist для проверки основных сценариев после запуска проекта.

## Auth

- [ ] Register создаёт пользователя `CLIENT`.
- [ ] Register создаёт пользователя `FREELANCER`.
- [ ] Login возвращает пользователя в приложение.
- [ ] Logout очищает сессию и возвращает на страницу входа.
- [ ] Protected routes без token перенаправляют на `/login`.
- [ ] Admin routes недоступны для `CLIENT` и `FREELANCER`.

## CLIENT

- [ ] `CLIENT` создаёт task через `/tasks/create`.
- [ ] `CLIENT` видит детали task.
- [ ] `CLIENT` видит bids по задаче.
- [ ] `CLIENT` принимает bid.
- [ ] После принятия bid создаётся contract.
- [ ] `CLIENT` открывает contract details.
- [ ] `CLIENT` подтверждает submitted milestone.
- [ ] `CLIENT` может создать dispute по active contract.
- [ ] `CLIENT` может оставить review после completed contract.

## FREELANCER

- [ ] `FREELANCER` просматривает список tasks.
- [ ] `FREELANCER` открывает task details.
- [ ] `FREELANCER` отправляет bid.
- [ ] `FREELANCER` видит свой contract после принятия ставки.
- [ ] `FREELANCER` отправляет milestone на проверку.
- [ ] `FREELANCER` отправляет сообщение в contract chat.
- [ ] `FREELANCER` может оставить review после completed contract.

## ADMIN

- [ ] `ADMIN` открывает Admin Users.
- [ ] `ADMIN` блокирует и разблокирует пользователя.
- [ ] `ADMIN` открывает Admin Analytics.
- [ ] `ADMIN` открывает список disputes.
- [ ] `ADMIN` resolve/reject open dispute.
- [ ] `ADMIN` просматривает logs.

## Realtime

- [ ] `new_bid` приходит в task room при создании ставки.
- [ ] `new_message` приходит в contract room при отправке сообщения.
- [ ] `notification_created` приходит в user room при создании уведомления.

## API и инфраструктура

- [ ] `GET http://localhost:5000/health` возвращает `{ "status": "ok" }`.
- [ ] Swagger открывается по `http://localhost:5000/api-docs`.
- [ ] Frontend открывается по `http://localhost:5173`.
- [ ] `npm run build` во frontend проходит без ошибок.
