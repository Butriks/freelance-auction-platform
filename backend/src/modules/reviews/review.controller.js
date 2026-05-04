const reviewService = require('./review.service');
const {
  contractIdParamSchema,
  userIdParamSchema,
  createReviewSchema,
  listUserReviewsQuerySchema,
} = require('./review.validation');

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

const createReview = async (req, res, next) => {
  try {
    const { contractId } = validate(contractIdParamSchema, req.params);
    const data = validate(createReviewSchema, req.body);
    const result = await reviewService.createReview(req.user, contractId, data);

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

const getContractReviews = async (req, res, next) => {
  try {
    const { contractId } = validate(contractIdParamSchema, req.params);
    const reviews = await reviewService.getContractReviews(req.user, contractId);

    res.json({ reviews });
  } catch (error) {
    next(error);
  }
};

const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = validate(userIdParamSchema, req.params);
    const query = validate(listUserReviewsQuerySchema, req.query);
    const result = await reviewService.getUserReviews(userId, query);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getContractReviews,
  getUserReviews,
};

