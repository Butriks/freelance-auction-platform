const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class User extends Model {
  static associate(models) {
    User.hasOne(models.ClientProfile, {
      foreignKey: 'userId',
      as: 'clientProfile',
      onDelete: 'CASCADE',
    });

    User.hasOne(models.FreelancerProfile, {
      foreignKey: 'userId',
      as: 'freelancerProfile',
      onDelete: 'CASCADE',
    });

    User.hasMany(models.Review, {
      foreignKey: 'fromUserId',
      as: 'givenReviews',
      onDelete: 'CASCADE',
    });

    User.hasMany(models.Review, {
      foreignKey: 'toUserId',
      as: 'receivedReviews',
      onDelete: 'CASCADE',
    });
  }
}

User.init(
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('CLIENT', 'FREELANCER', 'ADMIN'),
      allowNull: false,
      defaultValue: 'CLIENT',
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'BLOCKED'),
      allowNull: false,
      defaultValue: 'ACTIVE',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'Users',
  },
);

module.exports = User;
