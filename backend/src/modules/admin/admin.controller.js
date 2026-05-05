const adminService = require('./admin.service');
const {
  userIdParamSchema,
  disputeIdParamSchema,
  listUsersQuerySchema,
  listTasksQuerySchema,
  listContractsQuerySchema,
  listDisputesQuerySchema,
  listLogsQuerySchema,
  resolveDisputeSchema,
} = require('./admin.validation');

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

const getUsers = async (req, res, next) => {
  try {
    const query = validate(listUsersQuerySchema, req.query);
    const result = await adminService.getUsers(query);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const { id } = validate(userIdParamSchema, req.params);
    const user = await adminService.blockUser(req.user, id);

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const unblockUser = async (req, res, next) => {
  try {
    const { id } = validate(userIdParamSchema, req.params);
    const user = await adminService.unblockUser(req.user, id);

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const query = validate(listTasksQuerySchema, req.query);
    const result = await adminService.getTasks(query);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getContracts = async (req, res, next) => {
  try {
    const query = validate(listContractsQuerySchema, req.query);
    const result = await adminService.getContracts(query);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getDisputes = async (req, res, next) => {
  try {
    const query = validate(listDisputesQuerySchema, req.query);
    const result = await adminService.getDisputes(query);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const resolveDispute = async (req, res, next) => {
  try {
    const { id } = validate(disputeIdParamSchema, req.params);
    const data = validate(resolveDisputeSchema, req.body);
    const io = req.app.get('io');
    const dispute = await adminService.resolveDispute(req.user, id, data, { io });

    res.json({ dispute });
  } catch (error) {
    next(error);
  }
};

const getLogs = async (req, res, next) => {
  try {
    const query = validate(listLogsQuerySchema, req.query);
    const result = await adminService.getLogs(query);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await adminService.getAnalytics();

    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  blockUser,
  unblockUser,
  getTasks,
  getContracts,
  getDisputes,
  resolveDispute,
  getLogs,
  getAnalytics,
};

