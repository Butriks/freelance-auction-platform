const {
  sequelize,
  Wallet,
  WalletTransaction,
} = require('../../models');
const { createLog } = require('../../services/logService');

const USD = 'USD';

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const decimalToCents = (value) => {
  const raw = String(value ?? '0').trim();
  const normalized = raw.includes('.') ? raw : `${raw}.00`;
  const [whole, fraction = ''] = normalized.split('.');
  const cents = `${fraction}00`.slice(0, 2);

  return BigInt(whole || '0') * 100n + BigInt(cents);
};

const centsToDecimal = (value) => {
  const sign = value < 0n ? '-' : '';
  const absolute = value < 0n ? -value : value;
  const whole = absolute / 100n;
  const cents = String(absolute % 100n).padStart(2, '0');

  return `${sign}${whole}.${cents}`;
};

const getOrCreateWallet = async (userId, transaction) => {
  const findOptions = {
    where: { userId },
    transaction,
  };

  if (transaction) {
    findOptions.lock = transaction.LOCK.UPDATE;
  }

  let wallet = await Wallet.findOne(findOptions);

  if (!wallet) {
    wallet = await Wallet.create(
      {
        userId,
        balance: '0.00',
        currency: USD,
      },
      transaction ? { transaction } : undefined,
    );
  }

  return wallet;
};

const createWalletTransaction = async ({
  wallet,
  userId,
  type,
  direction,
  amount,
  balanceBefore,
  balanceAfter,
  contractId,
  milestoneId,
  paymentId,
  metadata,
  transaction,
}) => WalletTransaction.create(
  {
    walletId: wallet.id,
    userId,
    type,
    direction,
    amount,
    balanceBefore,
    balanceAfter,
    currency: USD,
    status: 'SUCCESS',
    contractId: contractId ?? null,
    milestoneId: milestoneId ?? null,
    paymentId: paymentId ?? null,
    metadata: metadata ?? null,
  },
  transaction ? { transaction } : undefined,
);

const applyWalletChange = async ({
  userId,
  amount,
  type,
  direction,
  contractId,
  milestoneId,
  paymentId,
  metadata,
  transaction,
}) => {
  const wallet = await getOrCreateWallet(userId, transaction);
  const amountDecimal = centsToDecimal(decimalToCents(amount));
  const balanceBeforeCents = decimalToCents(wallet.balance);
  const amountCents = decimalToCents(amountDecimal);
  const balanceAfterCents = direction === 'CREDIT'
    ? balanceBeforeCents + amountCents
    : balanceBeforeCents - amountCents;

  if (balanceAfterCents < 0n) {
    throw createHttpError(400, 'Insufficient wallet balance');
  }

  const balanceBefore = centsToDecimal(balanceBeforeCents);
  const balanceAfter = centsToDecimal(balanceAfterCents);

  await wallet.update(
    {
      balance: balanceAfter,
      currency: USD,
    },
    transaction ? { transaction } : undefined,
  );

  const walletTransaction = await createWalletTransaction({
    wallet,
    userId,
    type,
    direction,
    amount: amountDecimal,
    balanceBefore,
    balanceAfter,
    contractId,
    milestoneId,
    paymentId,
    metadata,
    transaction,
  });

  return {
    wallet,
    transaction: walletTransaction,
  };
};

const getMyWallet = async (userId) => getOrCreateWallet(userId);

const getMyTransactions = async (userId, { type, limit, offset }) => {
  const where = { userId };

  if (type) {
    where.type = type;
  }

  const { rows, count } = await WalletTransaction.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    transactions: rows,
    count,
    limit,
    offset,
  };
};

const mockTopUp = async (userId, amount) => {
  const result = await sequelize.transaction(async (transaction) => applyWalletChange({
    userId,
    amount,
    type: 'MOCK_TOP_UP',
    direction: 'CREDIT',
    metadata: { source: 'mock-top-up', currency: USD },
    transaction,
  }));

  await createLog({
    userId,
    action: 'MOCK_TOP_UP',
    entityType: 'WalletTransaction',
    entityId: result.transaction.id,
    metadata: {
      amount: result.transaction.amount,
      currency: USD,
    },
  });

  return result;
};

const debitForEscrowHold = async ({
  userId,
  amount,
  contractId,
  paymentId,
  metadata,
  transaction,
}) => applyWalletChange({
  userId,
  amount,
  type: 'ESCROW_HOLD',
  direction: 'DEBIT',
  contractId,
  paymentId,
  metadata,
  transaction,
});

const creditForEscrowRelease = async ({
  userId,
  amount,
  contractId,
  milestoneId,
  paymentId,
  metadata,
  transaction,
}) => applyWalletChange({
  userId,
  amount,
  type: 'ESCROW_RELEASE',
  direction: 'CREDIT',
  contractId,
  milestoneId,
  paymentId,
  metadata,
  transaction,
});

const getWalletAnalytics = async () => {
  const wallets = await Wallet.findAll({
    where: {
      currency: USD,
    },
    attributes: ['balance'],
  });

  const transactionsCount = await WalletTransaction.count({
    where: {
      currency: USD,
      status: 'SUCCESS',
    },
  });

  const totalCents = wallets.reduce(
    (sum, wallet) => sum + decimalToCents(wallet.balance),
    0n,
  );

  return {
    walletBalancesTotalUsd: Number(centsToDecimal(totalCents)),
    walletTransactionsTotal: transactionsCount,
  };
};

module.exports = {
  USD,
  decimalToCents,
  centsToDecimal,
  getOrCreateWallet,
  getMyWallet,
  getMyTransactions,
  mockTopUp,
  debitForEscrowHold,
  creditForEscrowRelease,
  getWalletAnalytics,
};
