const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Contract extends Model {
  static associate(models) {
    Contract.belongsTo(models.Task, {
      foreignKey: 'taskId',
      as: 'task',
      onDelete: 'CASCADE',
    });

    Contract.belongsTo(models.ClientProfile, {
      foreignKey: 'clientId',
      as: 'client',
      onDelete: 'CASCADE',
    });

    Contract.belongsTo(models.FreelancerProfile, {
      foreignKey: 'freelancerId',
      as: 'freelancer',
      onDelete: 'CASCADE',
    });

    Contract.belongsTo(models.Bid, {
      foreignKey: 'acceptedBidId',
      as: 'acceptedBid',
    });

    Contract.hasMany(models.Milestone, {
      foreignKey: 'contractId',
      as: 'milestones',
      onDelete: 'CASCADE',
    });

    Contract.hasOne(models.Escrow, {
      foreignKey: 'contractId',
      as: 'escrow',
      onDelete: 'CASCADE',
    });

    Contract.hasMany(models.Payment, {
      foreignKey: 'contractId',
      as: 'payments',
      onDelete: 'CASCADE',
    });
  }
}

Contract.init(
  {
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    freelancerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    acceptedBidId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Contract',
    tableName: 'Contracts',
  },
);

module.exports = Contract;

