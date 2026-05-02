const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Category extends Model {
  static associate(models) {
    Category.hasMany(models.Task, {
      foreignKey: 'categoryId',
      as: 'tasks',
      onDelete: 'SET NULL',
    });
  }
}

Category.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Category',
    tableName: 'Categories',
  },
);

module.exports = Category;

