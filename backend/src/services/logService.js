const { Log } = require('../models');

const createLog = async ({
  userId,
  action,
  entityType,
  entityId,
  metadata,
  transaction,
}) => {
  try {
    return await Log.create(
      {
        userId: userId ?? null,
        action,
        entityType,
        entityId: entityId ?? null,
        metadata: metadata ?? null,
      },
      transaction ? { transaction } : undefined,
    );
  } catch (error) {
    console.error('Failed to create log:', error);
    return null;
  }
};

module.exports = {
  createLog,
};

