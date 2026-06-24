'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Escrows', 'releasedAmount', {
      allowNull: false,
      type: Sequelize.DECIMAL(12, 2),
      defaultValue: 0,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Escrows', 'releasedAmount');
  },
};
