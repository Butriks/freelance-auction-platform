const { Op } = require('sequelize');
const {
  Task,
  Category,
  ClientProfile,
  User,
} = require('../../models');
const { createLog } = require('../../services/logService');

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const taskIncludes = [
  {
    model: Category,
    as: 'category',
  },
  {
    model: ClientProfile,
    as: 'client',
    include: [
      {
        model: User,
        as: 'user',
        attributes: { exclude: ['passwordHash'] },
      },
    ],
  },
];

const findClientProfileByUserId = async (userId) => {
  const clientProfile = await ClientProfile.findOne({
    where: { userId },
  });

  if (!clientProfile) {
    throw createHttpError(403, 'Client profile is required');
  }

  return clientProfile;
};

const ensureCategoryExists = async (categoryId) => {
  const category = await Category.findByPk(categoryId);

  if (!category) {
    throw createHttpError(404, 'Category not found');
  }
};

const getTaskOrFail = async (taskId) => {
  const task = await Task.findByPk(taskId, {
    include: taskIncludes,
  });

  if (!task) {
    throw createHttpError(404, 'Task not found');
  }

  return task;
};

const ensureOwnerCanChangeTask = (task, clientProfile) => {
  if (task.clientId !== clientProfile.id) {
    throw createHttpError(403, 'Access denied');
  }

  if (task.status !== 'OPEN') {
    throw createHttpError(400, 'Only OPEN tasks can be changed');
  }
};

const createTask = async (userId, data) => {
  const clientProfile = await findClientProfileByUserId(userId);
  await ensureCategoryExists(data.categoryId);

  const task = await Task.create({
    clientId: clientProfile.id,
    categoryId: data.categoryId,
    title: data.title,
    description: data.description,
    budget: data.budget,
    deadline: data.deadline,
    status: 'OPEN',
  });

  const createdTask = await getTaskOrFail(task.id);

  await createLog({
    userId,
    action: 'TASK_CREATED',
    entityType: 'Task',
    entityId: task.id,
    metadata: {
      clientId: clientProfile.id,
      categoryId: data.categoryId,
    },
  });

  return createdTask;
};

const listTasks = async ({
  status,
  categoryId,
  limit,
  offset,
  search,
}) => {
  const where = {};

  if (status) {
    where.status = status;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { rows, count } = await Task.findAndCountAll({
    where,
    include: taskIncludes,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    distinct: true,
  });

  return {
    tasks: rows,
    count,
    limit,
    offset,
  };
};

const getTaskById = async (taskId) => getTaskOrFail(taskId);

const updateTask = async (userId, taskId, data) => {
  const clientProfile = await findClientProfileByUserId(userId);
  const task = await getTaskOrFail(taskId);

  ensureOwnerCanChangeTask(task, clientProfile);

  if (data.categoryId) {
    await ensureCategoryExists(data.categoryId);
  }

  await task.update(data);

  return getTaskOrFail(task.id);
};

const deleteTask = async (userId, taskId) => {
  const clientProfile = await findClientProfileByUserId(userId);
  const task = await getTaskOrFail(taskId);

  ensureOwnerCanChangeTask(task, clientProfile);

  await task.destroy();
};

module.exports = {
  createTask,
  listTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
