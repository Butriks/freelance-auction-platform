const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Notification extends Model {
  static associate(models) {
    Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE',
    });
  }
}

Notification.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        'NEW_BID',
        'BID_ACCEPTED',
        'CONTRACT_CREATED',
        'MILESTONE_SUBMITTED',
        'MILESTONE_APPROVED',
        'MILESTONE_REJECTED',
        'CONTRACT_COMPLETED',
        'NEW_MESSAGE',
        'REVIEW_CREATED',
        'SYSTEM',
      ),
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'Notification',
    tableName: 'Notifications',
  },
);

module.exports = Notification;

