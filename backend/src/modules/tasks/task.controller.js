const taskService = require('./task.service');
const {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
} = require('./task.validation');

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

const createTask = async (req, res, next) => {
  try {
    const data = validate(createTaskSchema, req.body);
    const task = await taskService.createTask(req.user.id, data);

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

const listTasks = async (req, res, next) => {
  try {
    const query = validate(listTasksQuerySchema, req.query);
    const result = await taskService.listTasks(query);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const data = validate(updateTaskSchema, req.body);
    const task = await taskService.updateTask(req.user.id, req.params.id, data);

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.user.id, req.params.id);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
};

