const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Message extends Model {
  static associate(models) {
    Message.belongsTo(models.Contract, {
      foreignKey: 'contractId',
      as: 'contract',
      onDelete: 'CASCADE',
    });

    Message.belongsTo(models.User, {
      foreignKey: 'senderId',
      as: 'sender',
      onDelete: 'RESTRICT',
    });
  }
}

Message.init(
  {
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Message',
    tableName: 'Messages',
  },
);

module.exports = Message;

