const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class ClientProfile extends Model {
  static associate(models) {
    ClientProfile.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE',
    });

    ClientProfile.hasMany(models.Task, {
      foreignKey: 'clientId',
      as: 'tasks',
      onDelete: 'CASCADE',
    });
  }
}

ClientProfile.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'ClientProfile',
    tableName: 'ClientProfiles',
  },
);

module.exports = ClientProfile;
