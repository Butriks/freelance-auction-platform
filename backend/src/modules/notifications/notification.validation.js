const Joi = require('joi');

const notificationTypes = [
  'NEW_BID',
  'BID_ACCEPTED',
  'CONTRACT_CREATED',
  'MILESTONE_SUBMITTED',
  'MILESTONE_APPROVED',
  'MILESTONE_REJECTED',
  'CONTRACT_COMPLETED',
  'NEW_MESSAGE',
  'REVIEW_CREATED',
  'SYSTEM',
];

const notificationIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const listNotificationsQuerySchema = Joi.object({
  isRead: Joi.boolean(),
  type: Joi.string().valid(...notificationTypes),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

module.exports = {
  notificationIdParamSchema,
  listNotificationsQuerySchema,
};

