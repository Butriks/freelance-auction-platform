const { sequelize } = require('../../models');
const {
  Contract,
  Task,
  Milestone,
  Escrow,
  Payment,
  ClientProfile,
  FreelancerProfile,
  User,
} = require('../../models');
const { createNotification } = require('../../services/notificationService');
const { createLog } = require('../../services/logService');
const {
  creditForEscrowRelease,
  decimalToCents,
  centsToDecimal,
} = require('../wallet/wallet.service');

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

const contractSummaryInclude = [
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

const findContractOrFail = async (contractId, options = {}) => {
  const contract = await Contract.findByPk(contractId, options);

  if (!contract) {
    throw createHttpError(404, 'Contract not found');
  }

  return contract;
};

const ensureContractParticipantAccess = async (user, contract, options = {}) => {
  if (user.role === 'ADMIN') {
    return;
  }

  if (user.role === 'CLIENT') {
    const clientProfile = await findClientProfileByUserId(user.id, options);

    if (clientProfile && clientProfile.id === contract.clientId) {
      return;
    }
  }

  if (user.role === 'FREELANCER') {
    const freelancerProfile = await findFreelancerProfileByUserId(user.id, options);

    if (freelancerProfile && freelancerProfile.id === contract.freelancerId) {
      return;
    }
  }

  throw createHttpError(403, 'Access denied');
};

const ensureClientOwnerAccess = async (user, contract, options = {}) => {
  const clientProfile = await findClientProfileByUserId(user.id, options);

  if (!clientProfile || clientProfile.id !== contract.clientId) {
    throw createHttpError(403, 'Access denied');
  }

  return clientProfile;
};

const ensureFreelancerExecutorAccess = async (user, contract, options = {}) => {
  const freelancerProfile = await findFreelancerProfileByUserId(user.id, options);

  if (!freelancerProfile || freelancerProfile.id !== contract.freelancerId) {
    throw createHttpError(403, 'Access denied');
  }

  return freelancerProfile;
};

const ensureContractIsActive = (contract) => {
  if (contract.status !== 'ACTIVE') {
    throw createHttpError(400, 'Contract must be ACTIVE');
  }
};

const getMilestoneOrFail = async (milestoneId, options = {}) => {
  const milestone = await Milestone.findByPk(milestoneId, {
    include: [
      {
        model: Contract,
        as: 'contract',
        include: [
          {
            model: Task,
            as: 'task',
          },
          {
            model: Escrow,
            as: 'escrow',
          },
        ],
      },
    ],
    ...options,
  });

  if (!milestone) {
    throw createHttpError(404, 'Milestone not found');
  }

  return milestone;
};

const getContractSummary = async (contractId, options = {}) => Contract.findByPk(contractId, {
  include: contractSummaryInclude,
  ...options,
});

const listMilestones = async (user, contractId) => {
  const contract = await findContractOrFail(contractId);

  await ensureContractParticipantAccess(user, contract);

  return Milestone.findAll({
    where: { contractId },
    order: [['createdAt', 'ASC']],
  });
};

const createMilestone = async (user, contractId, data) => {
  const contract = await findContractOrFail(contractId);

  ensureContractIsActive(contract);
  await ensureClientOwnerAccess(user, contract);

  return Milestone.create({
    contractId,
    title: data.title,
    description: data.description,
    amount: data.amount,
    dueDate: data.dueDate,
    status: 'PENDING',
  });
};

const submitMilestone = async (user, milestoneId, options = {}) => {
  const milestone = await getMilestoneOrFail(milestoneId);
  const { contract } = milestone;

  ensureContractIsActive(contract);
  await ensureFreelancerExecutorAccess(user, contract);

  if (!['PENDING', 'REJECTED'].includes(milestone.status)) {
    throw createHttpError(400, 'Milestone must be PENDING or REJECTED');
  }

  await milestone.update({ status: 'SUBMITTED' });

  const clientProfile = await ClientProfile.findByPk(contract.clientId);

  if (clientProfile) {
    await createNotification({
      userId: clientProfile.userId,
      title: 'Milestone submitted',
      message: 'A freelancer submitted a milestone for review.',
      type: 'MILESTONE_SUBMITTED',
      io: options.io,
    });
  }

  await createLog({
    userId: user.id,
    action: 'MILESTONE_SUBMITTED',
    entityType: 'Milestone',
    entityId: milestone.id,
    metadata: { contractId: contract.id },
  });

  return milestone;
};

const approveMilestone = async (user, milestoneId, options = {}) => {
  const result = await sequelize.transaction(async (transaction) => {
    const milestone = await getMilestoneOrFail(milestoneId, { transaction });
    const { contract } = milestone;

    ensureContractIsActive(contract);

    const clientProfile = await ensureClientOwnerAccess(user, contract, { transaction });

    if (milestone.status !== 'SUBMITTED') {
      throw createHttpError(400, 'Milestone must be SUBMITTED');
    }

    const freelancerProfile = await FreelancerProfile.findByPk(contract.freelancerId, {
      transaction,
    });

    if (!freelancerProfile) {
      throw createHttpError(404, 'Freelancer profile not found');
    }

    const escrow = contract.escrow;

    if (!escrow) {
      throw createHttpError(404, 'Escrow not found');
    }

    await milestone.update({ status: 'APPROVED' }, { transaction });

    const payment = await Payment.create(
      {
        contractId: contract.id,
        fromUserId: clientProfile.userId,
        toUserId: freelancerProfile.userId,
        amount: milestone.amount,
        type: 'RELEASE',
        status: 'MOCK_SUCCESS',
      },
      { transaction },
    );

    const walletResult = await creditForEscrowRelease({
      userId: freelancerProfile.userId,
      amount: milestone.amount,
      contractId: contract.id,
      milestoneId: milestone.id,
      paymentId: payment.id,
      metadata: {
        milestoneTitle: milestone.title,
        currency: 'USD',
      },
      transaction,
    });

    const releasedAmountCents = decimalToCents(escrow.releasedAmount || '0.00')
      + decimalToCents(milestone.amount);
    const escrowAmountCents = decimalToCents(escrow.amount);
    const releasedAmount = centsToDecimal(releasedAmountCents);
    const updates = {};
    const taskUpdates = {};

    if (releasedAmountCents >= escrowAmountCents) {
      await escrow.update({ releasedAmount, status: 'RELEASED' }, { transaction });
      updates.status = 'COMPLETED';
      updates.completedAt = new Date();
      taskUpdates.status = 'COMPLETED';
    } else {
      await escrow.update({ releasedAmount, status: 'PARTIALLY_RELEASED' }, { transaction });
    }

    if (Object.keys(updates).length > 0) {
      await contract.update(updates, { transaction });
    }

    if (Object.keys(taskUpdates).length > 0 && contract.task) {
      await contract.task.update(taskUpdates, { transaction });
    }

    const refreshedMilestone = await Milestone.findByPk(milestone.id, { transaction });
    const contractSummary = await getContractSummary(contract.id, { transaction });

    return {
      milestone: refreshedMilestone,
      contractSummary,
      freelancerUserId: freelancerProfile.userId,
      clientUserId: clientProfile.userId,
      contractCompleted: updates.status === 'COMPLETED',
      escrowReleaseTransactionId: walletResult.transaction.id,
    };
  });

  await createNotification({
    userId: result.freelancerUserId,
    title: 'Milestone approved',
    message: 'Your milestone was approved.',
    type: 'MILESTONE_APPROVED',
    io: options.io,
  });

  await createNotification({
    userId: result.freelancerUserId,
    title: 'Wallet credited',
    message: 'Milestone reward was added to your wallet.',
    type: 'SYSTEM',
    io: options.io,
  });

  if (result.contractCompleted) {
    await createNotification({
      userId: result.clientUserId,
      title: 'Contract completed',
      message: 'The contract has been completed.',
      type: 'CONTRACT_COMPLETED',
      io: options.io,
    });
    await createNotification({
      userId: result.freelancerUserId,
      title: 'Contract completed',
      message: 'The contract has been completed.',
      type: 'CONTRACT_COMPLETED',
      io: options.io,
    });
  }

  await createLog({
    userId: user.id,
    action: 'MILESTONE_APPROVED',
    entityType: 'Milestone',
    entityId: result.milestone.id,
    metadata: {
      contractId: result.contractSummary.id,
      contractCompleted: result.contractCompleted,
    },
  });

  await createLog({
    userId: user.id,
    action: 'ESCROW_RELEASE',
    entityType: 'WalletTransaction',
    entityId: result.escrowReleaseTransactionId,
    metadata: {
      contractId: result.contractSummary.id,
      milestoneId: result.milestone.id,
      currency: 'USD',
    },
  });

  return {
    milestone: result.milestone,
    contractSummary: result.contractSummary,
  };
};

const rejectMilestone = async (user, milestoneId, { reason }, options = {}) => {
  const milestone = await getMilestoneOrFail(milestoneId);
  const { contract } = milestone;

  ensureContractIsActive(contract);
  await ensureClientOwnerAccess(user, contract);

  if (milestone.status !== 'SUBMITTED') {
    throw createHttpError(400, 'Milestone must be SUBMITTED');
  }

  await milestone.update({ status: 'REJECTED' });

  const freelancerProfile = await FreelancerProfile.findByPk(contract.freelancerId);

  if (freelancerProfile) {
    await createNotification({
      userId: freelancerProfile.userId,
      title: 'Milestone rejected',
      message: 'Your milestone was rejected.',
      type: 'MILESTONE_REJECTED',
      io: options.io,
    });
  }

  await createLog({
    userId: user.id,
    action: 'MILESTONE_REJECTED',
    entityType: 'Milestone',
    entityId: milestone.id,
    metadata: {
      contractId: contract.id,
      reason,
    },
  });

  return {
    message: 'Milestone rejected',
    reason,
    milestone,
  };
};

module.exports = {
  listMilestones,
  createMilestone,
  submitMilestone,
  approveMilestone,
  rejectMilestone,
};
