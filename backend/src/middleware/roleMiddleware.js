const roleMiddleware = (...roles) => (req, res, next) => {
  const allowedRoles = roles.flat();

  if (!req.user || !allowedRoles.includes(req.user.role)) {
    const error = new Error('Access denied');
    error.statusCode = 403;
    return next(error);
  }

  return next();
};

module.exports = roleMiddleware;
