const Joi = require('joi');

const contractIdParamSchema = Joi.object({
  contractId: Joi.number().integer().positive().required(),
});

const milestoneIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const createMilestoneSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().allow('', null),
  amount: Joi.number().greater(0).required(),
  dueDate: Joi.date().iso().required(),
  status: Joi.forbidden(),
});

const rejectMilestoneSchema = Joi.object({
  reason: Joi.string().trim().min(1).required(),
});

module.exports = {
  contractIdParamSchema,
  milestoneIdParamSchema,
  createMilestoneSchema,
  rejectMilestoneSchema,
};

