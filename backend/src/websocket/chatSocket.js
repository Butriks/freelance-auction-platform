const { Contract, ClientProfile, FreelancerProfile, User } = require('../models');

const buildContractRoomName = (contractId) => `contract_${contractId}`;

const parseContractId = (payload) => {
  const contractId = Number(payload && payload.contractId);

  if (!Number.isInteger(contractId) || contractId <= 0) {
    throw new Error('Valid contractId is required');
  }

  return contractId;
};

const findContractOrFail = async (contractId) => {
  const contract = await Contract.findByPk(contractId, {
    include: [
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
    ],
  });

  if (!contract) {
    throw new Error('Contract not found');
  }

  return contract;
};

const ensureContractSocketAccess = (user, contract) => {
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

  throw new Error('Access denied');
};

const registerChatSocketHandlers = (socket) => {
  socket.on('join_contract_room', async (payload, callback) => {
    try {
      const contractId = parseContractId(payload);
      const contract = await findContractOrFail(contractId);

      ensureContractSocketAccess(socket.user, contract);

      const room = buildContractRoomName(contractId);
      await socket.join(room);

      const response = { contractId, room };
      socket.emit('contract_room_joined', response);

      if (typeof callback === 'function') {
        callback({ ok: true, ...response });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({ ok: false, message: error.message });
      } else {
        socket.emit('socket_error', { message: error.message });
      }
    }
  });

  socket.on('leave_contract_room', async (payload, callback) => {
    try {
      const contractId = parseContractId(payload);
      const room = buildContractRoomName(contractId);

      await socket.leave(room);

      const response = { contractId, room };
      socket.emit('contract_room_left', response);

      if (typeof callback === 'function') {
        callback({ ok: true, ...response });
      }
    } catch (error) {
      if (typeof callback === 'function') {
        callback({ ok: false, message: error.message });
      } else {
        socket.emit('socket_error', { message: error.message });
      }
    }
  });
};

const emitNewMessage = (io, contractId, message) => {
  try {
    if (!io) {
      return;
    }

    io.to(buildContractRoomName(contractId)).emit('new_message', message);
  } catch (error) {
    console.error('Failed to emit new_message event:', error);
  }
};

module.exports = {
  buildContractRoomName,
  registerChatSocketHandlers,
  emitNewMessage,
};

