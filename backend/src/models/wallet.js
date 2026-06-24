const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Wallet extends Model {
  static associate(models) {
    Wallet.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE',
    });

    Wallet.hasMany(models.WalletTransaction, {
      foreignKey: 'walletId',
      as: 'transactions',
    });
  }
}

Wallet.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'USD',
    },
  },
  {
    sequelize,
    modelName: 'Wallet',
    tableName: 'Wallets',
  },
);

module.exports = Wallet;
