const sequelize = require('../config/database');
const User = require('./user');
const ClientProfile = require('./clientProfile');
const FreelancerProfile = require('./freelancerProfile');
const Category = require('./category');
const Task = require('./task');

const models = {
  User,
  ClientProfile,
  FreelancerProfile,
  Category,
  Task,
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
