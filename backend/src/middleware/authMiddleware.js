const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Authentication token is required');
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(payload.userId, {
      attributes: { exclude: ['passwordHash'] },
    });

    if (!user) {
      const error = new Error('Invalid authentication token');
      error.statusCode = 401;
      throw error;
    }

    if (user.status === 'BLOCKED') {
      const error = new Error('User is blocked');
      error.statusCode = 403;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError'
      || error.name === 'TokenExpiredError'
    ) {
      error.statusCode = 401;
      error.message = 'Invalid authentication token';
    }

    next(error);
  }
};

module.exports = authMiddleware;
