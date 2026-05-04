const { fn, col } = require('sequelize');
const {
  sequelize,
  Contract,
  Review,
  User,
  ClientProfile,
  FreelancerProfile,
} = require('../../models');

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const userInclude = (as) => ({
  model: User,
  as,
  attributes: { exclude: ['passwordHash'] },
});

const contractParticipantIncludes = [
  {
    model: ClientProfile,
    as: 'client',
    include: [userInclude('user')],
  },
  {
    model: FreelancerProfile,
    as: 'freelancer',
    include: [userInclude('user')],
  },
];

const reviewIncludes = [
  userInclude('fromUser'),
  userInclude('toUser'),
];

const findContractOrFail = async (contractId, options = {}) => {
  const contract = await Contract.findByPk(contractId, {
    ...options,
    include: contractParticipantIncludes,
  });

  if (!contract) {
    throw createHttpError(404, 'Contract not found');
  }

  return contract;
};

const findUserOrFail = async (userId, options = {}) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['passwordHash'] },
    ...options,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  return user;
};

const ensureContractReviewAccess = (user, contract) => {
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

const resolveReviewDirection = (user, contract) => {
  const clientUserId = contract.client && contract.client.user
    ? contract.client.user.id
    : null;
  const freelancerUserId = contract.freelancer && contract.freelancer.user
    ? contract.freelancer.user.id
    : null;

  if (user.id === clientUserId) {
    return {
      fromUserId: clientUserId,
      toUserId: freelancerUserId,
      targetRole: 'FREELANCER',
    };
  }

  if (user.id === freelancerUserId) {
    return {
      fromUserId: freelancerUserId,
      toUserId: clientUserId,
      targetRole: 'CLIENT',
    };
  }

  throw createHttpError(403, 'Access denied');
};

const recalculateUserRating = async (toUserId, targetRole, transaction) => {
  const avgResult = await Review.findOne({
    where: { toUserId },
    attributes: [[fn('AVG', col('rating')), 'averageRating']],
    raw: true,
    transaction,
  });

  const averageRating = Number(avgResult && avgResult.averageRating ? avgResult.averageRating : 0);
  const roundedRating = Number(averageRating.toFixed(2));

  if (targetRole === 'FREELANCER') {
    const freelancerProfile = await FreelancerProfile.findOne({
      where: { userId: toUserId },
      transaction,
    });

    if (!freelancerProfile) {
      throw createHttpError(404, 'Freelancer profile not found');
    }

    await freelancerProfile.update({ rating: roundedRating }, { transaction });
  }

  if (targetRole === 'CLIENT') {
    const clientProfile = await ClientProfile.findOne({
      where: { userId: toUserId },
      transaction,
    });

    if (!clientProfile) {
      throw createHttpError(404, 'Client profile not found');
    }

    await clientProfile.update({ rating: roundedRating }, { transaction });
  }

  return roundedRating;
};

const createReview = async (user, contractId, data) => {
  return sequelize.transaction(async (transaction) => {
    const contract = await findContractOrFail(contractId, { transaction });

    if (contract.status !== 'COMPLETED') {
      throw createHttpError(400, 'Contract must be COMPLETED');
    }

    const { fromUserId, toUserId, targetRole } = resolveReviewDirection(user, contract);

    if (!toUserId || fromUserId === toUserId) {
      throw createHttpError(400, 'Cannot create review for yourself');
    }

    const existingReview = await Review.findOne({
      where: {
        contractId,
        fromUserId,
        toUserId,
      },
      transaction,
    });

    if (existingReview) {
      throw createHttpError(409, 'Review already exists');
    }

    try {
      const review = await Review.create(
        {
          contractId,
          fromUserId,
          toUserId,
          rating: data.rating,
          comment: data.comment,
        },
        { transaction },
      );

      const updatedRating = await recalculateUserRating(
        toUserId,
        targetRole,
        transaction,
      );

      const createdReview = await Review.findByPk(review.id, {
        include: reviewIncludes,
        transaction,
      });

      return {
        review: createdReview,
        updatedRating,
      };
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw createHttpError(409, 'Review already exists');
      }

      throw error;
    }
  });
};

const getContractReviews = async (user, contractId) => {
  const contract = await findContractOrFail(contractId);

  ensureContractReviewAccess(user, contract);

  return Review.findAll({
    where: { contractId },
    include: reviewIncludes,
    order: [['createdAt', 'ASC']],
  });
};

const getUserReviews = async (userId, { limit, offset }) => {
  await findUserOrFail(userId);

  const { rows, count } = await Review.findAndCountAll({
    where: { toUserId: userId },
    include: [userInclude('fromUser')],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    distinct: true,
  });

  return {
    reviews: rows,
    count,
    limit,
    offset,
  };
};

module.exports = {
  createReview,
  getContractReviews,
  getUserReviews,
};
