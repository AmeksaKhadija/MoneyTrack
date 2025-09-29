'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Budget extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Budget.belongsTo(models.User, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      Budget.belongsTo(models.Category, { foreignKey: 'category_id', onDelete: 'CASCADE' });
    }
  }
  Budget.init({
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    total_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    month_year: { type: DataTypes.STRING }
  }, {
    sequelize,
    modelName: 'Budget',
    tableName: 'budgets'
  });
  return Budget;
};