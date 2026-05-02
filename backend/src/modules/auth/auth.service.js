const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  sequelize,
  User,
  ClientProfile,
  FreelancerProfile,
} = require('../../models');

const SALT_ROUNDS = 10;

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const sanitizeUser = (user) => {
  const plainUser = user.get ? user.get({ plain: true }) : user;
  const { passwordHash, ...safeUser } = plainUser;

  return safeUser;
};

const createToken = (user) => jwt.sign(
  {
    userId: user.id,
    role: user.role,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
);

const buildAuthResponse = (user) => ({
  token: createToken(user),
  user: sanitizeUser(user),
});

const register = async (data) => {
  const existingUser = await User.findOne({
    where: { email: data.email },
  });

  if (existingUser) {
    throw createHttpError(409, 'Email already exists');
  }

  try {
    return await sequelize.transaction(async (transaction) => {
      const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

      const user = await User.create(
        {
          email: data.email,
          passwordHash,
          role: data.role,
        },
        { transaction },
      );

      if (data.role === 'CLIENT') {
        await ClientProfile.create(
          {
            userId: user.id,
            companyName: data.companyName,
            description: data.description,
          },
          { transaction },
        );
      }

      if (data.role === 'FREELANCER') {
        await FreelancerProfile.create(
          {
            userId: user.id,
            firstName: data.firstName,
            lastName: data.lastName,
            bio: data.bio,
            hourlyRate: data.hourlyRate,
          },
          { transaction },
        );
      }

      return buildAuthResponse(user);
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw createHttpError(409, 'Email already exists');
    }

    throw error;
  }
};

const login = async ({ email, password }) => {
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw createHttpError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid email or password');
  }

  if (user.status === 'BLOCKED') {
    throw createHttpError(403, 'User is blocked');
  }

  return buildAuthResponse(user);
};

const getMe = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['passwordHash'] },
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  return user;
};

module.exports = {
  register,
  login,
  getMe,
};
