const Joi = require('joi');

const walletTransactionTypes = [
  'MOCK_TOP_UP',
  'ESCROW_HOLD',
  'ESCROW_RELEASE',
  'ESCROW_REFUND',
  'ADMIN_ADJUSTMENT',
];

const listTransactionsQuerySchema = Joi.object({
  type: Joi.string().valid(...walletTransactionTypes),
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});

const mockTopUpSchema = Joi.object({
  amount: Joi.number().positive().max(100000).required(),
});

module.exports = {
  listTransactionsQuerySchema,
  mockTopUpSchema,
};
