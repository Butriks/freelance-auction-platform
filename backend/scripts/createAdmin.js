require('dotenv').config();

const bcrypt = require('bcrypt');
const sequelize = require('../src/config/database');
const { User } = require('../src/models');

const SALT_ROUNDS = 10;
const DEFAULT_ADMIN_EMAIL = 'admin@test.com';
const DEFAULT_ADMIN_PASSWORD = '12345678';

const createAdmin = async () => {
  const email = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  try {
    await sequelize.authenticate();

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      await existingUser.update({
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE',
      });

      console.log(`Admin user updated: ${email}`);
      return;
    }

    await User.create({
      email,
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    });

    console.log(`Admin user created: ${email}`);
  } catch (error) {
    console.error('Failed to create admin user:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

createAdmin();

