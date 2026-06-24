const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class WalletTransaction extends Model {
  static associate(models) {
    WalletTransaction.belongsTo(models.Wallet, {
      foreignKey: 'walletId',
      as: 'wallet',
      onDelete: 'CASCADE',
    });

    WalletTransaction.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE',
    });

    WalletTransaction.belongsTo(models.Contract, {
      foreignKey: 'contractId',
      as: 'contract',
    });

    WalletTransaction.belongsTo(models.Milestone, {
      foreignKey: 'milestoneId',
      as: 'milestone',
    });

    WalletTransaction.belongsTo(models.Payment, {
      foreignKey: 'paymentId',
      as: 'payment',
    });
  }
}

WalletTransaction.init(
  {
    walletId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('MOCK_TOP_UP', 'ESCROW_HOLD', 'ESCROW_RELEASE', 'ESCROW_REFUND', 'ADMIN_ADJUSTMENT'),
      allowNull: false,
    },
    direction: {
      type: DataTypes.ENUM('CREDIT', 'DEBIT'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    balanceBefore: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    balanceAfter: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USD',
    },
    status: {
      type: DataTypes.ENUM('SUCCESS', 'FAILED'),
      allowNull: false,
      defaultValue: 'SUCCESS',
    },
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    milestoneId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'WalletTransaction',
    tableName: 'WalletTransactions',
  },
);

module.exports = WalletTransaction;
