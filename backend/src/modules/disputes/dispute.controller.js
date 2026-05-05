const disputeService = require('./dispute.service');
const {
  contractIdParamSchema,
  createDisputeSchema,
  listDisputesQuerySchema,
} = require('./dispute.validation');

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

const createDispute = async (req, res, next) => {
  try {
    const { contractId } = validate(contractIdParamSchema, req.params);
    const data = validate(createDisputeSchema, req.body);
    const io = req.app.get('io');
    const dispute = await disputeService.createDispute(req.user, contractId, data, { io });

    res.status(201).json({ dispute });
  } catch (error) {
    next(error);
  }
};

const getMyDisputes = async (req, res, next) => {
  try {
    const query = validate(listDisputesQuerySchema, req.query);
    const result = await disputeService.getMyDisputes(req.user, query);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDispute,
  getMyDisputes,
};

