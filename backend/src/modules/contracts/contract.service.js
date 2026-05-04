const { Op } = require('sequelize');
const {
  sequelize,
  Contract,
  Task,
  Bid,
  ClientProfile,
  FreelancerProfile,
  Milestone,
  Escrow,
  Payment,
  User,
} = require('../../models');
const { createNotification } = require('../../services/notificationService');
const { createLog } = require('../../services/logService');

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const userInclude = () => ({
  model: User,
  as: 'user',
  attributes: { exclude: ['passwordHash'] },
});

const paymentUserIncludes = [
  {
    model: User,
    as: 'fromUser',
    attributes: { exclude: ['passwordHash'] },
  },
  {
    model: User,
    as: 'toUser',
    attributes: { exclude: ['passwordHash'] },
  },
];

const fullContractIncludes = [
  {
    model: Task,
    as: 'task',
  },
  {
    model: Bid,
    as: 'acceptedBid',
    include: [
      {
        model: FreelancerProfile,
        as: 'freelancer',
        include: [userInclude()],
      },
    ],
  },
  {
    model: ClientProfile,
    as: 'client',
    include: [userInclude()],
  },
  {
    model: FreelancerProfile,
    as: 'freelancer',
    include: [userInclude()],
  },
  {
    model: Milestone,
    as: 'milestones',
    separate: true,
    order: [['createdAt', 'ASC']],
  },
  {
    model: Escrow,
    as: 'escrow',
  },
  {
    model: Payment,
    as: 'payments',
    separate: true,
    order: [['createdAt', 'ASC']],
    include: paymentUserIncludes,
  },
];

const listContractIncludes = [
  {
    model: Task,
    as: 'task',
  },
  {
    model: ClientProfile,
    as: 'client',
    include: [userInclude()],
  },
  {
    model: FreelancerProfile,
    as: 'freelancer',
    include: [userInclude()],
  },
  {
    model: Escrow,
    as: 'escrow',
  },
];

const findClientProfileByUserId = async (userId, options = {}) => ClientProfile.findOne({
  where: { userId },
  ...options,
});

const findFreelancerProfileByUserId = async (userId, options = {}) => FreelancerProfile.findOne({
  where: { userId },
  ...options,
});

const getFullContractById = async (contractId) => {
  const contract = await Contract.findByPk(contractId, {
    include: fullContractIncludes,
  });

  if (!contract) {
    throw createHttpError(404, 'Contract not found');
  }

  return contract;
};

const acceptBid = async (userId, taskId, bidId, options = {}) => {
  const result = await sequelize.transaction(async (transaction) => {
    const clientProfile = await findClientProfileByUserId(userId, { transaction });

    if (!clientProfile) {
      throw createHttpError(403, 'Client profile is required');
    }

    const task = await Task.findByPk(taskId, { transaction });

    if (!task) {
      throw createHttpError(404, 'Task not found');
    }

    if (task.clientId !== clientProfile.id) {
      throw createHttpError(403, 'Access denied');
    }

    if (task.status !== 'OPEN') {
      throw createHttpError(400, 'Only OPEN tasks can accept bids');
    }

    const bid = await Bid.findByPk(bidId, { transaction });

    if (!bid || bid.taskId !== task.id) {
      throw createHttpError(404, 'Bid not found');
    }

    if (bid.status !== 'PENDING') {
      throw createHttpError(400, 'Only PENDING bids can be accepted');
    }

    const existingContract = await Contract.findOne({
      where: { taskId: task.id },
      transaction,
    });

    if (existingContract) {
      throw createHttpError(409, 'Contract already exists for this task');
    }

    const freelancerProfile = await FreelancerProfile.findByPk(
      bid.freelancerId,
      { transaction },
    );

    if (!freelancerProfile) {
      throw createHttpError(404, 'Freelancer profile not found');
    }

    try {
      const contract = await Contract.create(
        {
          taskId: task.id,
          clientId: task.clientId,
          freelancerId: bid.freelancerId,
          acceptedBidId: bid.id,
          totalAmount: bid.price,
          status: 'ACTIVE',
          startedAt: new Date(),
        },
        { transaction },
      );

      await task.update({ status: 'IN_PROGRESS' }, { transaction });
      await bid.update({ status: 'ACCEPTED' }, { transaction });
      await Bid.update(
        { status: 'REJECTED' },
        {
          where: {
            taskId: task.id,
            status: 'PENDING',
            id: { [Op.ne]: bid.id },
          },
          transaction,
        },
      );

      await Escrow.create(
        {
          contractId: contract.id,
          amount: bid.price,
          status: 'HELD',
        },
        { transaction },
      );

      await Payment.create(
        {
          contractId: contract.id,
          fromUserId: clientProfile.userId,
          toUserId: freelancerProfile.userId,
          amount: bid.price,
          type: 'DEPOSIT',
          status: 'MOCK_SUCCESS',
        },
        { transaction },
      );

      await Milestone.create(
        {
          contractId: contract.id,
          title: 'Initial milestone',
          description: 'Default milestone created with contract',
          amount: bid.price,
          status: 'PENDING',
          dueDate: task.deadline,
        },
        { transaction },
      );

      return {
        contractId: contract.id,
        freelancerUserId: freelancerProfile.userId,
      };
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw createHttpError(409, 'Contract already exists for this task');
      }

      throw error;
    }
  });

  const contract = await getFullContractById(result.contractId);

  await createNotification({
    userId: result.freelancerUserId,
    title: 'Your bid was accepted',
    message: 'Your bid was accepted and a contract was created.',
    type: 'BID_ACCEPTED',
    io: options.io,
  });

  await createLog({
    userId,
    action: 'CONTRACT_CREATED',
    entityType: 'Contract',
    entityId: contract.id,
    metadata: {
      taskId,
      bidId,
      freelancerId: contract.freelancerId,
    },
  });

  return contract;
};

const getMyContracts = async (user, { status, limit, offset }) => {
  const where = {};

  if (status) {
    where.status = status;
  }

  if (user.role === 'CLIENT') {
    const clientProfile = await findClientProfileByUserId(user.id);
    where.clientId = clientProfile ? clientProfile.id : null;
  }

  if (user.role === 'FREELANCER') {
    const freelancerProfile = await findFreelancerProfileByUserId(user.id);
    where.freelancerId = freelancerProfile ? freelancerProfile.id : null;
  }

  const { rows, count } = await Contract.findAndCountAll({
    where,
    include: listContractIncludes,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    distinct: true,
  });

  return {
    contracts: rows,
    count,
    limit,
    offset,
  };
};

const ensureContractAccess = async (user, contract) => {
  if (user.role === 'ADMIN') {
    return;
  }

  if (user.role === 'CLIENT') {
    const clientProfile = await findClientProfileByUserId(user.id);

    if (clientProfile && contract.clientId === clientProfile.id) {
      return;
    }
  }

  if (user.role === 'FREELANCER') {
    const freelancerProfile = await findFreelancerProfileByUserId(user.id);

    if (freelancerProfile && contract.freelancerId === freelancerProfile.id) {
      return;
    }
  }

  throw createHttpError(403, 'Access denied');
};

const getContractForUser = async (user, contractId) => {
  const contract = await getFullContractById(contractId);

  await ensureContractAccess(user, contract);

  return contract;
};

module.exports = {
  acceptBid,
  getMyContracts,
  getContractForUser,
};
