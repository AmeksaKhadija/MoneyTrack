'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Category.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
      Category.hasMany(models.Transaction, { foreignKey: 'category_id', as: 'transactions', onDelete: 'SET NULL' });
      Category.hasMany(models.Budget, { foreignKey: 'category_id', as: 'budgets', onDelete: 'SET NULL' });
    }
  }
  Category.init({
    user_id: DataTypes.INTEGER,
    category_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Category',
  });
  return Category;
};