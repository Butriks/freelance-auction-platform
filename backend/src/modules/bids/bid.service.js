const {
  Bid,
  Task,
  FreelancerProfile,
  ClientProfile,
  User,
} = require('../../models');

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const bidIncludes = [
  {
    model: FreelancerProfile,
    as: 'freelancer',
    attributes: ['id', 'firstName', 'lastName', 'rating'],
    include: [
      {
        model: User,
        as: 'user',
        attributes: { exclude: ['passwordHash'] },
      },
    ],
  },
];

const findTaskOrFail = async (taskId) => {
  const task = await Task.findByPk(taskId, {
    include: [
      {
        model: ClientProfile,
        as: 'client',
      },
    ],
  });

  if (!task) {
    throw createHttpError(404, 'Task not found');
  }

  return task;
};

const findFreelancerProfileByUserId = async (userId) => {
  const freelancerProfile = await FreelancerProfile.findOne({
    where: { userId },
  });

  if (!freelancerProfile) {
    throw createHttpError(403, 'Freelancer profile is required');
  }

  return freelancerProfile;
};

const getBidOrFail = async (bidId) => Bid.findByPk(bidId, {
  include: bidIncludes,
});

const createBid = async (userId, taskId, data) => {
  const task = await findTaskOrFail(taskId);

  if (task.status !== 'OPEN') {
    throw createHttpError(400, 'Only OPEN tasks can receive bids');
  }

  if (task.client && task.client.userId === userId) {
    throw createHttpError(403, 'Task owner cannot bid on own task');
  }

  const freelancerProfile = await findFreelancerProfileByUserId(userId);

  const existingBid = await Bid.findOne({
    where: {
      taskId,
      freelancerId: freelancerProfile.id,
    },
  });

  if (existingBid) {
    throw createHttpError(409, 'Bid already exists for this task');
  }

  try {
    const bid = await Bid.create({
      taskId,
      freelancerId: freelancerProfile.id,
      price: data.price,
      deliveryDays: data.deliveryDays,
      comment: data.comment,
      status: 'PENDING',
    });

    return getBidOrFail(bid.id);
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw createHttpError(409, 'Bid already exists for this task');
    }

    throw error;
  }
};

const listBidsByTask = async (taskId) => {
  await findTaskOrFail(taskId);

  return Bid.findAll({
    where: { taskId },
    attributes: [
      'id',
      'price',
      'deliveryDays',
      'comment',
      'status',
      'createdAt',
    ],
    include: bidIncludes,
    order: [
      ['price', 'ASC'],
      [{ model: FreelancerProfile, as: 'freelancer' }, 'rating', 'DESC'],
      ['createdAt', 'ASC'],
    ],
  });
};

module.exports = {
  createBid,
  listBidsByTask,
};

