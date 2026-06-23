# Демонстрационный сценарий

## Подготовка

1. Запустить PostgreSQL.
2. Настроить `backend/.env` и `frontend/.env` на основе `.env.example`.
3. Выполнить миграции и seed категорий:

```bash
cd backend
npm run db:migrate
npm run db:seed
npm run create:admin
npm run dev
```

4. В отдельном терминале запустить frontend:

```bash
cd frontend
npm run dev
```

5. Открыть `http://localhost:5173`.

## Сценарий заказчика

1. Зарегистрироваться или войти как `CLIENT`.
2. Открыть Dashboard и показать role-based navigation.
3. Перейти в Tasks и создать новое задание.
4. Открыть детали задания и показать, что задача находится в статусе `OPEN`.
5. После появления ставки принять её кнопкой `Accept bid`.

## Сценарий исполнителя

1. Войти как `FREELANCER`.
2. Открыть список задач.
3. Перейти в детали открытой задачи.
4. Подать ставку с ценой, сроком выполнения и комментарием.
5. Показать, что ставка появилась в списке и может обновляться в realtime.

## Сценарий контракта

1. После принятия ставки открыть Contracts.
2. Перейти в детали созданного контракта.
3. Показать участников, сумму, accepted bid, mock escrow и payments.
4. Как `FREELANCER` отправить milestone на проверку.
5. Как `CLIENT` подтвердить milestone.
6. Показать изменение статусов milestone, escrow, contract и task.

## Чат и уведомления

1. Открыть contract chat в деталях контракта.
2. Отправить сообщение от одного пользователя.
3. Показать получение сообщения вторым пользователем через Socket.IO.
4. Открыть Notifications и показать новые уведомления.
5. Отметить уведомление прочитанным или использовать `Mark all as read`.

## Отзывы

1. Завершить контракт после подтверждения milestone.
2. Оставить отзыв от `CLIENT` или `FREELANCER`.
3. Показать список отзывов по контракту.
4. Открыть Profile и показать received reviews.

## Администратор

1. Войти как `ADMIN`.
2. Открыть Admin Analytics и показать общие метрики.
3. Открыть Admin Users и показать управление пользователями.
4. Открыть Admin Disputes и показать обработку споров.
5. Открыть Admin Logs и показать журнал действий.

## Что показать на защите

- Ролевую модель `CLIENT / FREELANCER / ADMIN`.
- Создание задачи и подачу ставки.
- Realtime событие `new_bid`.
- Создание контракта после принятия ставки.
- Workflow milestones и mock escrow/payments.
- Contract chat и realtime `new_message`.
- Уведомления и realtime `notification_created`.
- Reviews и пересчёт рейтинга.
- Admin panel: users, analytics, disputes, logs.
- Swagger API documentation по адресу `http://localhost:5000/api-docs`.
