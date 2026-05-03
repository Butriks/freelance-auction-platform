const { Task } = require('../models');

const buildTaskRoomName = (taskId) => `task_${taskId}`;

const parseTaskId = (payload) => {
  const taskId = Number(payload && payload.taskId);

  if (!Number.isInteger(taskId) || taskId <= 0) {
    throw new Error('Valid taskId is required');
  }

  return taskId;
};

const registerAuctionSocketHandlers = (socket) => {
  socket.on('join_task_room', async (payload, callback) => {
    try {
      const taskId = parseTaskId(payload);
      const task = await Task.findByPk(taskId);

      if (!task) {
        throw new Error('Task not found');
      }

      const room = buildTaskRoomName(taskId);
      await socket.join(room);

      const response = { taskId, room };
      socket.emit('task_room_joined', response);

      if (typeof callback === 'function') {
        callback({ ok: true, ...response });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({ ok: false, message: error.message });
      } else {
        socket.emit('socket_error', { message: error.message });
      }
    }
  });

  socket.on('leave_task_room', async (payload, callback) => {
    try {
      const taskId = parseTaskId(payload);
      const room = buildTaskRoomName(taskId);

      await socket.leave(room);

      const response = { taskId, room };
      socket.emit('task_room_left', response);

      if (typeof callback === 'function') {
        callback({ ok: true, ...response });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({ ok: false, message: error.message });
      } else {
        socket.emit('socket_error', { message: error.message });
      }
    }
  });
};

const emitNewBid = (io, taskId, bid) => {
  try {
    if (!io) {
      return;
    }

    io.to(buildTaskRoomName(taskId)).emit('new_bid', bid);
  } catch (error) {
    console.error('Failed to emit new_bid event:', error);
  }
};

module.exports = {
  registerAuctionSocketHandlers,
  emitNewBid,
};

