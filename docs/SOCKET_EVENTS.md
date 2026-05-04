# Socket Events

Socket.IO is attached to the backend HTTP server.

## Connect

Client URL:

```text
http://localhost:5000
```

Pass the JWT token received from REST auth in the Socket.IO handshake:

```js
const socket = io('http://localhost:5000', {
  auth: {
    token: 'JWT_TOKEN',
  },
});
```

The backend verifies `socket.handshake.auth.token`. Missing, invalid, expired, or blocked-user tokens are rejected.

After successful auth, the socket automatically joins a personal room:

```text
user_<userId>
```

## join_task_room

Join realtime updates for one task.

```js
socket.emit('join_task_room', { taskId: 1 }, (response) => {
  console.log(response);
});
```

Success response:

```json
{
  "ok": true,
  "taskId": 1,
  "room": "task_1"
}
```

The server also emits `task_room_joined`.

## leave_task_room

Leave realtime updates for one task.

```js
socket.emit('leave_task_room', { taskId: 1 }, (response) => {
  console.log(response);
});
```

The server also emits `task_room_left`.

## new_bid

Emitted to room `task_<taskId>` after a bid is successfully created through:

```text
POST /api/tasks/:taskId/bids
```

Payload contains the created bid, including bid fields and freelancer profile data returned by the REST service.

## join_contract_room

Join realtime chat updates for one contract.

```js
socket.emit('join_contract_room', { contractId: 1 }, (response) => {
  console.log(response);
});
```

Success response:

```json
{
  "ok": true,
  "contractId": 1,
  "room": "contract_1"
}
```

Only contract participants and `ADMIN` can join. The server also emits `contract_room_joined`.

## leave_contract_room

Leave contract chat updates.

```js
socket.emit('leave_contract_room', { contractId: 1 }, (response) => {
  console.log(response);
});
```

The server also emits `contract_room_left`.

## new_message

Emitted to room `contract_<contractId>` after a message is successfully created through:

```text
POST /api/contracts/:contractId/messages
```

Payload contains:

```json
{
  "id": 1,
  "contractId": 1,
  "senderId": 2,
  "text": "Hello, I have uploaded the first version.",
  "createdAt": "2026-05-05T10:00:00.000Z",
  "sender": {
    "id": 2,
    "email": "user@example.com",
    "role": "FREELANCER",
    "status": "ACTIVE"
  }
}
```

## notification_created

Emitted to room `user_<userId>` after a new notification is created for the user.

Payload contains the saved notification, for example:

```json
{
  "id": 10,
  "userId": 2,
  "title": "New message",
  "message": "You received a new message in contract chat.",
  "type": "NEW_MESSAGE",
  "isRead": false,
  "createdAt": "2026-05-05T12:00:00.000Z",
  "updatedAt": "2026-05-05T12:00:00.000Z"
}
```
