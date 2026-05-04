const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Milestone extends Model {
  static associate(models) {
    Milestone.belongsTo(models.Contract, {
      foreignKey: 'contractId',
      as: 'contract',
      onDelete: 'CASCADE',
    });
  }
}

Milestone.init(
  {
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Milestone',
    tableName: 'Milestones',
  },
);

module.exports = Milestone;

