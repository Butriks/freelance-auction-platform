const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Task extends Model {
  static associate(models) {
    Task.belongsTo(models.ClientProfile, {
      foreignKey: 'clientId',
      as: 'client',
      onDelete: 'CASCADE',
    });

    Task.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category',
      onDelete: 'SET NULL',
    });

    Task.hasMany(models.Bid, {
      foreignKey: 'taskId',
      as: 'bids',
      onDelete: 'CASCADE',
    });

    Task.hasOne(models.Contract, {
      foreignKey: 'taskId',
      as: 'contract',
      onDelete: 'CASCADE',
    });
  }
}

Task.init(
  {
    clientId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    budget: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    deadline: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'OPEN',
    },
  },
  {
    sequelize,
    modelName: 'Task',
    tableName: 'Tasks',
  },
);

module.exports = Task;
