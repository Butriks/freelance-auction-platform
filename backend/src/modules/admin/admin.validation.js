const Joi = require('joi');
const { disputeStatusSchema } = require('../disputes/dispute.validation');

const userRoleSchema = Joi.string().valid('CLIENT', 'FREELANCER', 'ADMIN');
const userStatusSchema = Joi.string().valid('ACTIVE', 'BLOCKED');
const taskStatusSchema = Joi.string().valid('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
const contractStatusSchema = Joi.string().valid('ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED');

const paginationSchema = {
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
};

const userIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const disputeIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const listUsersQuerySchema = Joi.object({
  role: userRoleSchema,
  status: userStatusSchema,
  search: Joi.string().trim().min(1),
  ...paginationSchema,
});

const listTasksQuerySchema = Joi.object({
  status: taskStatusSchema,
  categoryId: Joi.number().integer().positive(),
  search: Joi.string().trim().min(1),
  ...paginationSchema,
});

const listContractsQuerySchema = Joi.object({
  status: contractStatusSchema,
  ...paginationSchema,
});

const listDisputesQuerySchema = Joi.object({
  status: disputeStatusSchema,
  ...paginationSchema,
});

const listLogsQuerySchema = Joi.object({
  action: Joi.string().trim().min(1),
  entityType: Joi.string().trim().min(1),
  userId: Joi.number().integer().positive(),
  limit: Joi.number().integer().min(1).max(200).default(50),
  offset: Joi.number().integer().min(0).default(0),
});

const resolveDisputeSchema = Joi.object({
  status: Joi.string().valid('RESOLVED', 'REJECTED').required(),
  adminComment: Joi.string().max(3000).allow('', null),
});

module.exports = {
  userIdParamSchema,
  disputeIdParamSchema,
  listUsersQuerySchema,
  listTasksQuerySchema,
  listContractsQuerySchema,
  listDisputesQuerySchema,
  listLogsQuerySchema,
  resolveDisputeSchema,
};

