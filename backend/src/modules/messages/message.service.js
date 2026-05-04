const {
  Contract,
  Message,
  User,
  ClientProfile,
  FreelancerProfile,
} = require('../../models');

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const senderInclude = {
  model: User,
  as: 'sender',
  attributes: ['id', 'email', 'role', 'status'],
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

const findContractOrFail = async (contractId, options = {}) => {
  const contract = await Contract.findByPk(contractId, {
    ...options,
    include: contractParticipantInclude,
  });

  if (!contract) {
    throw createHttpError(404, 'Contract not found');
  }

  return contract;
};

const ensureContractAccess = (user, contract) => {
  if (user.role === 'ADMIN') {
    return;
  }

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

const getContractMessages = async (user, contractId, { limit, offset }) => {
  const contract = await findContractOrFail(contractId);

  ensureContractAccess(user, contract);

  const { rows, count } = await Message.findAndCountAll({
    where: { contractId },
    attributes: ['id', 'contractId', 'senderId', 'text', 'createdAt'],
    include: [senderInclude],
    limit,
    offset,
    order: [['createdAt', 'ASC']],
    distinct: true,
  });

  return {
    messages: rows,
    count,
    limit,
    offset,
  };
};

const createMessage = async (user, contractId, { text }) => {
  const contract = await findContractOrFail(contractId);

  ensureContractAccess(user, contract);

  const createdMessage = await Message.create({
    contractId,
    senderId: user.id,
    text,
  });

  return Message.findByPk(createdMessage.id, {
    attributes: ['id', 'contractId', 'senderId', 'text', 'createdAt'],
    include: [senderInclude],
  });
};

module.exports = {
  findContractOrFail,
  ensureContractAccess,
  getContractMessages,
  createMessage,
};

