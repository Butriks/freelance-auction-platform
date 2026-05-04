const { Notification } = require('../models');

const buildUserRoomName = (userId) => `user_${userId}`;

const createNotification = async ({
  userId,
  title,
  message,
  type,
  io,
  transaction,
}) => {
  try {
    const notification = await Notification.create(
      {
        userId,
        title,
        message,
        type,
      },
      transaction ? { transaction } : undefined,
    );

    try {
      if (io) {
        io.to(buildUserRoomName(userId)).emit('notification_created', notification);
      }
    } catch (emitError) {
      console.error('Failed to emit notification_created event:', emitError);
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};

module.exports = {
  buildUserRoomName,
  createNotification,
};

