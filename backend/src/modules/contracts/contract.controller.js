const contractService = require('./contract.service');
const {
  acceptBidParamsSchema,
  contractIdParamSchema,
  listContractsQuerySchema,
} = require('./contract.validation');

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

const acceptBid = async (req, res, next) => {
  try {
    const { taskId, bidId } = validate(acceptBidParamsSchema, req.params);
    const io = req.app.get('io');
    const contract = await contractService.acceptBid(req.user.id, taskId, bidId, { io });

    res.status(201).json({ contract });
  } catch (error) {
    next(error);
  }
};

const getMyContracts = async (req, res, next) => {
  try {
    const query = validate(listContractsQuerySchema, req.query);
    const result = await contractService.getMyContracts(req.user, query);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getContractById = async (req, res, next) => {
  try {
    const { id } = validate(contractIdParamSchema, req.params);
    const contract = await contractService.getContractForUser(req.user, id);

    res.json({ contract });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  acceptBid,
  getMyContracts,
  getContractById,
};
