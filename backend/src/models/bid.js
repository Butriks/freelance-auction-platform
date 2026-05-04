const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Bid extends Model {
  static associate(models) {
    Bid.belongsTo(models.Task, {
      foreignKey: 'taskId',
      as: 'task',
      onDelete: 'CASCADE',
    });

    Bid.belongsTo(models.FreelancerProfile, {
      foreignKey: 'freelancerId',
      as: 'freelancer',
      onDelete: 'CASCADE',
    });

    Bid.hasOne(models.Contract, {
      foreignKey: 'acceptedBidId',
      as: 'contract',
    });
  }
}

Bid.init(
  {
    taskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    freelancerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    deliveryDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING',
    },
  },
  {
    sequelize,
    modelName: 'Bid',
    tableName: 'Bids',
  },
);

module.exports = Bid;
