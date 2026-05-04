const sequelize = require('../config/database');
const User = require('./user');
const ClientProfile = require('./clientProfile');
const FreelancerProfile = require('./freelancerProfile');
const Category = require('./category');
const Task = require('./task');
const Bid = require('./bid');
const Contract = require('./contract');
const Milestone = require('./milestone');
const Escrow = require('./escrow');
const Payment = require('./payment');
const Review = require('./review');

const models = {
  User,
  ClientProfile,
  FreelancerProfile,
  Category,
  Task,
  Bid,
  Contract,
  Milestone,
  Escrow,
  Payment,
  Review,
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
