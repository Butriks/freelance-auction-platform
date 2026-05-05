const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Dispute extends Model {
  static associate(models) {
    Dispute.belongsTo(models.Contract, {
      foreignKey: 'contractId',
      as: 'contract',
      onDelete: 'CASCADE',
    });

    Dispute.belongsTo(models.User, {
      foreignKey: 'openedByUserId',
      as: 'openedByUser',
      onDelete: 'RESTRICT',
    });

    Dispute.belongsTo(models.User, {
      foreignKey: 'resolvedByAdminId',
      as: 'resolvedByAdmin',
      onDelete: 'SET NULL',
    });
  }
}

Dispute.init(
  {
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    openedByUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'RESOLVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'OPEN',
    },
    adminComment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resolvedByAdminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Dispute',
    tableName: 'Disputes',
  },
);

module.exports = Dispute;

