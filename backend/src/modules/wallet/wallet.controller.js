const walletService = require('./wallet.service');
const {
  listTransactionsQuerySchema,
  mockTopUpSchema,
} = require('./wallet.validation');

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const validationError = new Error('Validation error');
    validationError.statusCode = 400;
    validationError.errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));
    throw validationError;
  }

  return value;
};

const getMyWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.getMyWallet(req.user.id);

    res.json({ wallet });
  } catch (error) {
    next(error);
  }
};

const getMyTransactions = async (req, res, next) => {
  try {
    const query = validate(listTransactionsQuerySchema, req.query);
    const result = await walletService.getMyTransactions(req.user.id, query);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const mockTopUp = async (req, res, next) => {
  try {
    const { amount } = validate(mockTopUpSchema, req.body);
    const result = await walletService.mockTopUp(req.user.id, amount);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyWallet,
  getMyTransactions,
  mockTopUp,
};
