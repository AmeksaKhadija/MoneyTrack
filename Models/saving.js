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
      // define association here
    }
  }
  Saving.init({
    user_id: DataTypes.INTEGER,
    goal_name: DataTypes.STRING,
    goal_amount: DataTypes.DECIMAL,
    saved_amount: DataTypes.DECIMAL,
    target_date: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Saving',
  });
  return Saving;
};