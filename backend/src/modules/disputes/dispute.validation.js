const Joi = require('joi');

const disputeStatusSchema = Joi.string().valid('OPEN', 'RESOLVED', 'REJECTED');

const contractIdParamSchema = Joi.object({
  contractId: Joi.number().integer().positive().required(),
});

const createDisputeSchema = Joi.object({
  reason: Joi.string().min(10).max(3000).required(),
});

const listDisputesQuerySchema = Joi.object({
  status: disputeStatusSchema,
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

module.exports = {
  disputeStatusSchema,
  contractIdParamSchema,
  createDisputeSchema,
  listDisputesQuerySchema,
};

