const { Notification } = require('../../models');

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getNotifications = async (userId, {
  isRead,
  type,
  limit,
  offset,
}) => {
  const where = { userId };

  if (typeof isRead === 'boolean') {
    where.isRead = isRead;
  }

  if (type) {
    where.type = type;
  }

  const { rows, count } = await Notification.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    notifications: rows,
    count,
    limit,
    offset,
  };
};

const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findByPk(notificationId);

  if (!notification) {
    throw createHttpError(404, 'Notification not found');
  }

  if (notification.userId !== userId) {
    throw createHttpError(403, 'Access denied');
  }

  await notification.update({ isRead: true });

  return notification;
};

const markAllAsRead = async (userId) => {
  const [updatedCount] = await Notification.update(
    { isRead: true },
    {
      where: {
        userId,
        isRead: false,
      },
    },
  );

  return { updatedCount };
};

const getUnreadCount = async (userId) => Notification.count({
  where: {
    userId,
    isRead: false,
  },
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};

