const { Op, fn, col } = require('sequelize');
const {
  sequelize,
  User,
  ClientProfile,
  FreelancerProfile,
  Category,
  Task,
  Bid,
  Contract,
  Escrow,
  Payment,
  Review,
  Dispute,
  Log,
  Wallet,
  WalletTransaction,
} = require('../../models');
const { createNotification } = require('../../services/notificationService');
const { createLog } = require('../../services/logService');
const { contractParticipantInclude, disputeIncludes } = require('../disputes/dispute.service');
const { decimalToCents, centsToDecimal } = require('../wallet/wallet.service');

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const userProfileIncludes = [
  {
    model: ClientProfile,
    as: 'clientProfile',
  },
  {
    model: FreelancerProfile,
    as: 'freelancerProfile',
  },
];

const userWithoutPassword = {
  exclude: ['passwordHash'],
};

const getUsers = async ({
  role,
  status,
  search,
  limit,
  offset,
}) => {
  const where = {};

  if (role) {
    where.role = role;
  }

  if (status) {
    where.status = status;
  }

  if (search) {
    where.email = { [Op.iLike]: `%${search}%` };
  }

  const { rows, count } = await User.findAndCountAll({
    where,
    attributes: userWithoutPassword,
    include: userProfileIncludes,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    distinct: true,
  });

  return {
    users: rows,
    count,
    limit,
    offset,
  };
};

const getUserOrFail = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: userWithoutPassword,
    include: userProfileIncludes,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  return user;
};

const blockUser = async (adminUser, userId) => {
  if (adminUser.id === userId) {
    throw createHttpError(400, 'Cannot block yourself');
  }

  const user = await getUserOrFail(userId);

  await user.update({ status: 'BLOCKED' });

  await createLog({
    userId: adminUser.id,
    action: 'USER_BLOCKED',
    entityType: 'User',
    entityId: user.id,
    metadata: { targetUserId: user.id },
  });

  return user;
};

const unblockUser = async (adminUser, userId) => {
  const user = await getUserOrFail(userId);

  await user.update({ status: 'ACTIVE' });

  await createLog({
    userId: adminUser.id,
    action: 'USER_UNBLOCKED',
    entityType: 'User',
    entityId: user.id,
    metadata: { targetUserId: user.id },
  });

  return user;
};

const getTasks = async ({
  status,
  categoryId,
  search,
  limit,
  offset,
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
    include: [
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
            attributes: userWithoutPassword,
          },
        ],
      },
    ],
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

const getContracts = async ({ status, limit, offset }) => {
  const where = {};

  if (status) {
    where.status = status;
  }

  const { rows, count } = await Contract.findAndCountAll({
    where,
    include: [
      {
        model: Task,
        as: 'task',
      },
      {
        model: ClientProfile,
        as: 'client',
        include: [
          {
            model: User,
            as: 'user',
            attributes: userWithoutPassword,
          },
        ],
      },
      {
        model: FreelancerProfile,
        as: 'freelancer',
        include: [
          {
            model: User,
            as: 'user',
            attributes: userWithoutPassword,
          },
        ],
      },
      {
        model: Escrow,
        as: 'escrow',
      },
    ],
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

const getDisputes = async ({ status, limit, offset }) => {
  const where = {};

  if (status) {
    where.status = status;
  }

  const { rows, count } = await Dispute.findAndCountAll({
    where,
    include: disputeIncludes,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    distinct: true,
  });

  return {
    disputes: rows,
    count,
    limit,
    offset,
  };
};

const getDisputeOrFail = async (disputeId, options = {}) => {
  const dispute = await Dispute.findByPk(disputeId, {
    ...options,
    include: disputeIncludes,
  });

  if (!dispute) {
    throw createHttpError(404, 'Dispute not found');
  }

  return dispute;
};

const resolveDispute = async (adminUser, disputeId, { status, adminComment }, options = {}) => {
  const dispute = await sequelize.transaction(async (transaction) => {
    const currentDispute = await Dispute.findByPk(disputeId, { transaction });

    if (!currentDispute) {
      throw createHttpError(404, 'Dispute not found');
    }

    const contract = await Contract.findByPk(currentDispute.contractId, { transaction });

    if (!contract) {
      throw createHttpError(404, 'Contract not found');
    }

    await currentDispute.update(
      {
        status,
        adminComment,
        resolvedByAdminId: adminUser.id,
        resolvedAt: new Date(),
      },
      { transaction },
    );

    if (
      contract.status === 'DISPUTED'
      && !['COMPLETED', 'CANCELLED'].includes(contract.status)
    ) {
      await contract.update({ status: 'ACTIVE' }, { transaction });
    }

    return currentDispute;
  });

  await createNotification({
    userId: dispute.openedByUserId,
    title: 'Dispute updated',
    message: 'Your dispute was reviewed by an admin.',
    type: 'SYSTEM',
    io: options.io,
  });

  await createLog({
    userId: adminUser.id,
    action: status === 'RESOLVED' ? 'DISPUTE_RESOLVED' : 'DISPUTE_REJECTED',
    entityType: 'Dispute',
    entityId: dispute.id,
    metadata: {
      contractId: dispute.contractId,
      openedByUserId: dispute.openedByUserId,
    },
  });

  return getDisputeOrFail(dispute.id);
};

const getLogs = async ({
  action,
  entityType,
  userId,
  limit,
  offset,
}) => {
  const where = {};

  if (action) {
    where.action = action;
  }

  if (entityType) {
    where.entityType = entityType;
  }

  if (userId) {
    where.userId = userId;
  }

  const { rows, count } = await Log.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: userWithoutPassword,
      },
    ],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    distinct: true,
  });

  return {
    logs: rows,
    count,
    limit,
    offset,
  };
};

const countByStatus = async (Model, statuses) => {
  const entries = await Promise.all(statuses.map(async (status) => [
    status,
    await Model.count({ where: { status } }),
  ]));

  return Object.fromEntries(entries);
};

const getAnalytics = async () => {
  const [
    totalUsers,
    clients,
    freelancers,
    admins,
    blocked,
    totalTasks,
    taskStatuses,
    totalContracts,
    contractStatuses,
    totalBids,
    bidStatuses,
    averageBidPriceRaw,
    totalDepositedRaw,
    totalReleasedRaw,
    totalReviews,
    averageRatingRaw,
    totalDisputes,
    disputeStatuses,
    walletBalancesRaw,
    walletTransactionsTotal,
    escrows,
  ] = await Promise.all([
    User.count(),
    User.count({ where: { role: 'CLIENT' } }),
    User.count({ where: { role: 'FREELANCER' } }),
    User.count({ where: { role: 'ADMIN' } }),
    User.count({ where: { status: 'BLOCKED' } }),
    Task.count(),
    countByStatus(Task, ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
    Contract.count(),
    countByStatus(Contract, ['ACTIVE', 'COMPLETED', 'DISPUTED', 'CANCELLED']),
    Bid.count(),
    countByStatus(Bid, ['PENDING', 'ACCEPTED', 'REJECTED']),
    Bid.findOne({ attributes: [[fn('AVG', col('price')), 'averagePrice']], raw: true }),
    Payment.findOne({
      where: { type: 'DEPOSIT', status: 'MOCK_SUCCESS' },
      attributes: [[fn('SUM', col('amount')), 'totalDeposited']],
      raw: true,
    }),
    Payment.findOne({
      where: { type: 'RELEASE', status: 'MOCK_SUCCESS' },
      attributes: [[fn('SUM', col('amount')), 'totalReleased']],
      raw: true,
    }),
    Review.count(),
    Review.findOne({ attributes: [[fn('AVG', col('rating')), 'averageRating']], raw: true }),
    Dispute.count(),
    countByStatus(Dispute, ['OPEN', 'RESOLVED', 'REJECTED']),
    Wallet.findAll({
      where: { currency: 'USD' },
      attributes: ['balance'],
    }),
    WalletTransaction.count({
      where: {
        currency: 'USD',
        status: 'SUCCESS',
      },
    }),
    Escrow.findAll({
      attributes: ['amount', 'releasedAmount', 'status'],
    }),
  ]);

  const walletBalancesTotalCents = walletBalancesRaw.reduce(
    (sum, wallet) => sum + decimalToCents(wallet.balance),
    0n,
  );
  const escrowReleasedCents = escrows.reduce(
    (sum, escrow) => sum + decimalToCents(escrow.releasedAmount || '0.00'),
    0n,
  );
  const escrowHeldCents = escrows.reduce((sum, escrow) => {
    if (!['HELD', 'PARTIALLY_RELEASED'].includes(escrow.status)) {
      return sum;
    }

    const held = decimalToCents(escrow.amount) - decimalToCents(escrow.releasedAmount || '0.00');
    return sum + (held > 0n ? held : 0n);
  }, 0n);

  return {
    users: {
      total: totalUsers,
      clients,
      freelancers,
      admins,
      blocked,
    },
    tasks: {
      total: totalTasks,
      open: taskStatuses.OPEN,
      inProgress: taskStatuses.IN_PROGRESS,
      completed: taskStatuses.COMPLETED,
      cancelled: taskStatuses.CANCELLED,
    },
    contracts: {
      total: totalContracts,
      active: contractStatuses.ACTIVE,
      completed: contractStatuses.COMPLETED,
      disputed: contractStatuses.DISPUTED,
      cancelled: contractStatuses.CANCELLED,
    },
    bids: {
      total: totalBids,
      pending: bidStatuses.PENDING,
      accepted: bidStatuses.ACCEPTED,
      rejected: bidStatuses.REJECTED,
      averagePrice: Number(Number(averageBidPriceRaw.averagePrice || 0).toFixed(2)),
    },
    payments: {
      totalDeposited: Number(Number(totalDepositedRaw.totalDeposited || 0).toFixed(2)),
      totalReleased: Number(Number(totalReleasedRaw.totalReleased || 0).toFixed(2)),
    },
    reviews: {
      total: totalReviews,
      averageRating: Number(Number(averageRatingRaw.averageRating || 0).toFixed(2)),
    },
    disputes: {
      total: totalDisputes,
      open: disputeStatuses.OPEN,
      resolved: disputeStatuses.RESOLVED,
      rejected: disputeStatuses.REJECTED,
    },
    wallet: {
      walletBalancesTotalUsd: Number(centsToDecimal(walletBalancesTotalCents)),
      walletTransactionsTotal,
      totalEscrowHeldUsd: Number(centsToDecimal(escrowHeldCents)),
      totalEscrowReleasedUsd: Number(centsToDecimal(escrowReleasedCents)),
    },
  };
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
