const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Payment extends Model {
  static associate(models) {
    Payment.belongsTo(models.Contract, {
      foreignKey: 'contractId',
      as: 'contract',
      onDelete: 'CASCADE',
    });

    Payment.belongsTo(models.User, {
      foreignKey: 'fromUserId',
      as: 'fromUser',
    });

    Payment.belongsTo(models.User, {
      foreignKey: 'toUserId',
      as: 'toUser',
    });
  }
}

Payment.init(
  {
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    fromUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    toUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('DEPOSIT', 'RELEASE', 'REFUND'),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('MOCK_SUCCESS', 'MOCK_FAILED'),
      allowNull: false,
      defaultValue: 'MOCK_SUCCESS',
    },
  },
  {
    sequelize,
    modelName: 'Payment',
    tableName: 'Payments',
  },
);

module.exports = Payment;

