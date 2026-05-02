const Joi = require('joi');

const taskIdParamSchema = Joi.object({
  taskId: Joi.number().integer().positive().required(),
});

const createBidSchema = Joi.object({
  price: Joi.number().greater(0).required(),
  deliveryDays: Joi.number().integer().greater(0).required(),
  comment: Joi.string().max(1000).allow('', null),
  status: Joi.forbidden(),
});

module.exports = {
  taskIdParamSchema,
  createBidSchema,
};

