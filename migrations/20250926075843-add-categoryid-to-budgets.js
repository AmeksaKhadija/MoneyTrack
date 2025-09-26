'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Budgets', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: true, 
      references: {
        model: 'Categories', 
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Budgets', 'category_id');
  }
};