'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      if (models.Budget) {
        User.hasMany(models.Budget, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      }
      if (models.Category) {
        User.hasMany(models.Category, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'categories' });
      }
      if (models.Saving) {
        User.hasMany(models.Saving, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'savings' });
      }
      if (models.Transaction) {
        User.hasMany(models.Transaction, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'transactions' });
      }
      if (models.Notification) {
        User.hasMany(models.Notification, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'notifications' });
      }
    }

  }
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [6, 255],
        notEmpty: true
      }
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true, // Recommended to keep timestamps for audit purposes
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });



  return User;
};