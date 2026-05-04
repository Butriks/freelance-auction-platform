const milestoneService = require('./milestone.service');
const {
  contractIdParamSchema,
  milestoneIdParamSchema,
  createMilestoneSchema,
  rejectMilestoneSchema,
} = require('./milestone.validation');

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

const listMilestones = async (req, res, next) => {
  try {
    const { contractId } = validate(contractIdParamSchema, req.params);
    const milestones = await milestoneService.listMilestones(req.user, contractId);

    res.json({ milestones });
  } catch (error) {
    next(error);
  }
};

const createMilestone = async (req, res, next) => {
  try {
    const { contractId } = validate(contractIdParamSchema, req.params);
    const data = validate(createMilestoneSchema, req.body);
    const milestone = await milestoneService.createMilestone(req.user, contractId, data);

    res.status(201).json({ milestone });
  } catch (error) {
    next(error);
  }
};

const submitMilestone = async (req, res, next) => {
  try {
    const { id } = validate(milestoneIdParamSchema, req.params);
    const io = req.app.get('io');
    const milestone = await milestoneService.submitMilestone(req.user, id, { io });

    res.json({ milestone });
  } catch (error) {
    next(error);
  }
};

const approveMilestone = async (req, res, next) => {
  try {
    const { id } = validate(milestoneIdParamSchema, req.params);
    const io = req.app.get('io');
    const result = await milestoneService.approveMilestone(req.user, id, { io });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const rejectMilestone = async (req, res, next) => {
  try {
    const { id } = validate(milestoneIdParamSchema, req.params);
    const data = validate(rejectMilestoneSchema, req.body);
    const io = req.app.get('io');
    const result = await milestoneService.rejectMilestone(req.user, id, data, { io });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listMilestones,
  createMilestone,
  submitMilestone,
  approveMilestone,
  rejectMilestone,
};
