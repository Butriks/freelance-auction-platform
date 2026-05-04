const Joi = require('joi');

const contractIdParamSchema = Joi.object({
  contractId: Joi.number().integer().positive().required(),
});

const createMessageSchema = Joi.object({
  text: Joi.string().trim().min(1).max(5000).required(),
});

const listMessagesQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(200).default(50),
  offset: Joi.number().integer().min(0).default(0),
});

module.exports = {
  contractIdParamSchema,
  createMessageSchema,
  listMessagesQuerySchema,
};

