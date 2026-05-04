const Joi = require('joi');

const contractStatusSchema = Joi.string().valid(
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
  'DISPUTED',
);

const acceptBidParamsSchema = Joi.object({
  taskId: Joi.number().integer().positive().required(),
  bidId: Joi.number().integer().positive().required(),
});

const contractIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const listContractsQuerySchema = Joi.object({
  status: contractStatusSchema,
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

module.exports = {
  acceptBidParamsSchema,
  contractIdParamSchema,
  listContractsQuerySchema,
};

