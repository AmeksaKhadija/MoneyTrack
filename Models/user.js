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
      User.hasMany(models.Budget, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      User.hasMany(models.Category, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'categories' });
      User.hasMany(models.Transaction, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      User.hasMany(models.Saving, { foreignKey: 'user_id', onDelete: 'CASCADE' });
      User.hasMany(models.notification, { foreignKey: 'user_id', onDelete: 'CASCADE' });
    }

  }
  User.init({
    username: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING, allowNull: false }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false
  });


  return User;
};