const Joi = require('joi');

const contractIdParamSchema = Joi.object({
  contractId: Joi.number().integer().positive().required(),
});

const userIdParamSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
});

const createReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(2000).allow('', null),
});

const listUserReviewsQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

module.exports = {
  contractIdParamSchema,
  userIdParamSchema,
  createReviewSchema,
  listUserReviewsQuerySchema,
};

