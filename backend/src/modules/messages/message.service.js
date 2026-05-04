const {
  Contract,
  Message,
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

const createMessage = async (user, contractId, { text }, options = {}) => {
  const contract = await findContractOrFail(contractId);

  ensureContractAccess(user, contract);

  const createdMessage = await Message.create({
    contractId,
    senderId: user.id,
    text,
  });

  const message = await Message.findByPk(createdMessage.id, {
    attributes: ['id', 'contractId', 'senderId', 'text', 'createdAt'],
    include: [senderInclude],
  });

  const clientUserId = contract.client && contract.client.user
    ? contract.client.user.id
    : null;
  const freelancerUserId = contract.freelancer && contract.freelancer.user
    ? contract.freelancer.user.id
    : null;
  const recipientIds = [];

  if (user.role === 'ADMIN') {
    if (clientUserId) {
      recipientIds.push(clientUserId);
    }
    if (freelancerUserId && freelancerUserId !== clientUserId) {
      recipientIds.push(freelancerUserId);
    }
  } else if (user.role === 'CLIENT') {
    if (freelancerUserId) {
      recipientIds.push(freelancerUserId);
    }
  } else if (user.role === 'FREELANCER') {
    if (clientUserId) {
      recipientIds.push(clientUserId);
    }
  }

  await Promise.all(recipientIds.map((recipientUserId) => createNotification({
    userId: recipientUserId,
    title: 'New message',
    message: 'You received a new message in contract chat.',
    type: 'NEW_MESSAGE',
    io: options.io,
  })));

  await createLog({
    userId: user.id,
    action: 'MESSAGE_CREATED',
    entityType: 'Message',
    entityId: message.id,
    metadata: { contractId },
  });

  return message;
};

module.exports = {
  findContractOrFail,
  ensureContractAccess,
  getContractMessages,
  createMessage,
};
