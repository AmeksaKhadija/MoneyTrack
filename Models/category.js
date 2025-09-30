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
      if (models.User) {
        Category.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
      }
      if (models.Transaction) {
        Category.hasMany(models.Transaction, { foreignKey: 'category_id', as: 'transactions', onDelete: 'SET NULL' });
      }
      if (models.Budget) {
        Category.hasMany(models.Budget, { foreignKey: 'category_id', as: 'budgets', onDelete: 'SET NULL' });
      }
    }
  }
  Category.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    category_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    type: {
      type: DataTypes.ENUM('income', 'expense'),
      allowNull: false,
      defaultValue: 'expense'
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: '#3b82f6'
    },
    icon: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
  return Category;
};