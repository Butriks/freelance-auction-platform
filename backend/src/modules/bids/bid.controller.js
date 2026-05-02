const bidService = require('./bid.service');
const { createBidSchema, taskIdParamSchema } = require('./bid.validation');

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

const getTaskId = (params) => validate(taskIdParamSchema, params).taskId;

const createBid = async (req, res, next) => {
  try {
    const taskId = getTaskId(req.params);
    const data = validate(createBidSchema, req.body);
    const bid = await bidService.createBid(req.user.id, taskId, data);

    res.status(201).json({ bid });
  } catch (error) {
    next(error);
  }
};

const listBidsByTask = async (req, res, next) => {
  try {
    const taskId = getTaskId(req.params);
    const bids = await bidService.listBidsByTask(taskId);

    res.json({ bids });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBid,
  listBidsByTask,
};

