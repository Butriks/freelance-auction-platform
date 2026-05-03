const jwt = require('jsonwebtoken');
const { User } = require('../models');

const socketAuthMiddleware = async (socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication token is required'));
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(payload.userId, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (!user) {
      return next(new Error('Invalid authentication token'));
    }

    if (user.status === 'BLOCKED') {
      return next(new Error('User is blocked'));
    }

    socket.user = user;
    return next();
  } catch (error) {
    return next(new Error('Invalid authentication token'));
  }
};

module.exports = socketAuthMiddleware;

