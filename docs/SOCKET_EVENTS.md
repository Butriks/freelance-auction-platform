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

