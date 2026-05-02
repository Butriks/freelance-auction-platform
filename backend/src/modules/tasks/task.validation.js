const Joi = require('joi');

const taskStatusSchema = Joi.string().valid(
  'OPEN',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
);

const createTaskSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  budget: Joi.number().greater(0).required(),
  deadline: Joi.date().iso().required(),
  categoryId: Joi.number().integer().positive().required(),
  status: Joi.forbidden(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(3),
  description: Joi.string().min(10),
  budget: Joi.number().greater(0),
  deadline: Joi.date().iso(),
  categoryId: Joi.number().integer().positive(),
  status: Joi.forbidden(),
}).min(1);

const listTasksQuerySchema = Joi.object({
  status: taskStatusSchema,
  categoryId: Joi.number().integer().positive(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
  search: Joi.string().trim().min(1),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
};

