'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Transaction.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
      Transaction.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category', onDelete: 'SET NULL' });
    }
  }
  Transaction.init({
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    category_id: { type: DataTypes.INTEGER, allowNull: true },
    amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    transaction_date: { type: DataTypes.DATEONLY, allowNull: false },
    description: { type: DataTypes.TEXT },
    type: { type: DataTypes.ENUM('income','expense'), allowNull: false }
  }, {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions'
  });
  return Transaction;
};