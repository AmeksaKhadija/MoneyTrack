'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Saving extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Saving.belongsTo(models.User, { foreignKey: 'user_id', as: 'user', onDelete: 'CASCADE' });
    }
  }
  Saving.init({
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    goal_name: { type: DataTypes.STRING },
    goal_amount: { type: DataTypes.DECIMAL(10,2), allowNull: false },
    saved_amount: { type: DataTypes.DECIMAL(10,2), defaultValue: 0 },
    target_date: { type: DataTypes.DATEONLY }
  }, {
    sequelize,
    modelName: 'Saving',
    tableName: 'savings'
  });
  return Saving;
};