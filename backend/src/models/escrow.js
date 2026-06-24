const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Escrow extends Model {
  static associate(models) {
    Escrow.belongsTo(models.Contract, {
      foreignKey: 'contractId',
      as: 'contract',
      onDelete: 'CASCADE',
    });
  }
}

Escrow.init(
  {
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    releasedAmount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('HELD', 'PARTIALLY_RELEASED', 'RELEASED', 'REFUNDED'),
      allowNull: false,
      defaultValue: 'HELD',
    },
  },
  {
    sequelize,
    modelName: 'Escrow',
    tableName: 'Escrows',
  },
);

module.exports = Escrow;
