const sequelize = require('../config/database');
const User = require('./user');
const ClientProfile = require('./clientProfile');
const FreelancerProfile = require('./freelancerProfile');

const models = {
  User,
  ClientProfile,
  FreelancerProfile,
};

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models,
};

