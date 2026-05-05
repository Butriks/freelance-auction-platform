const {
  Contract,
  Dispute,
  User,
  ClientProfile,
  FreelancerProfile,
} = require('../../models');
const { createNotification } = require('../../services/notificationService');
const { createLog } = require('../../services/logService');

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const contractParticipantInclude = [
  {
    model: ClientProfile,
    as: 'client',
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role', 'status'],
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
        attributes: ['id', 'email', 'role', 'status'],
      },
    ],
  },
];

const disputeIncludes = [
  {
    model: Contract,
    as: 'contract',
    include: contractParticipantInclude,
  },
  {
    model: User,
    as: 'openedByUser',
    attributes: { exclude: ['passwordHash'] },
  },
  {
    model: User,
    as: 'resolvedByAdmin',
    attributes: { exclude: ['passwordHash'] },
  },
];

const findContractOrFail = async (contractId) => {
  const contract = await Contract.findByPk(contractId, {
    include: contractParticipantInclude,
  });

  if (!contract) {
    throw createHttpError(404, 'Contract not found');
  }

  return contract;
};

const ensureContractParticipant = (user, contract) => {
  const clientUserId = contract.client && contract.client.user
    ? contract.client.user.id
    : null;
  const freelancerUserId = contract.freelancer && contract.freelancer.user
    ? contract.freelancer.user.id
    : null;

  if (user.id === clientUserId || user.id === freelancerUserId) {
    return;
  }

  throw createHttpError(403, 'Access denied');
};

const createDispute = async (user, contractId, { reason }, options = {}) => {
  const contract = await findContractOrFail(contractId);

  ensureContractParticipant(user, contract);

  const existingOpenDispute = await Dispute.findOne({
    where: {
      contractId,
      status: 'OPEN',
    },
  });

  if (existingOpenDispute) {
    throw createHttpError(409, 'Open dispute already exists for this contract');
  }

  const dispute = await Dispute.create({
    contractId,
    openedByUserId: user.id,
    reason,
    status: 'OPEN',
  });

  if (contract.status === 'ACTIVE') {
    await contract.update({ status: 'DISPUTED' });
  }

  const adminUsers = await User.findAll({
    where: {
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    attributes: ['id'],
  });

  await Promise.all(adminUsers.map((adminUser) => createNotification({
    userId: adminUser.id,
    title: 'New dispute opened',
    message: 'A new dispute was opened and needs review.',
    type: 'SYSTEM',
    io: options.io,
  })));

  await createLog({
    userId: user.id,
    action: 'DISPUTE_CREATED',
    entityType: 'Dispute',
    entityId: dispute.id,
    metadata: { contractId },
  });

  return Dispute.findByPk(dispute.id, {
    include: disputeIncludes,
  });
};

const getMyDisputes = async (user, { status, limit, offset }) => {
  const contractWhere = {};

  if (user.role === 'CLIENT') {
    const clientProfile = await ClientProfile.findOne({ where: { userId: user.id } });
    contractWhere.clientId = clientProfile ? clientProfile.id : null;
  }

  if (user.role === 'FREELANCER') {
    const freelancerProfile = await FreelancerProfile.findOne({ where: { userId: user.id } });
    contractWhere.freelancerId = freelancerProfile ? freelancerProfile.id : null;
  }

  const where = {};

  if (status) {
    where.status = status;
  }

  const { rows, count } = await Dispute.findAndCountAll({
    where,
    include: [
      {
        model: Contract,
        as: 'contract',
        where: contractWhere,
        include: contractParticipantInclude,
      },
      {
        model: User,
        as: 'openedByUser',
        attributes: { exclude: ['passwordHash'] },
      },
      {
        model: User,
        as: 'resolvedByAdmin',
        attributes: { exclude: ['passwordHash'] },
      },
    ],
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

module.exports = {
  disputeIncludes,
  contractParticipantInclude,
  findContractOrFail,
  createDispute,
  getMyDisputes,
};

