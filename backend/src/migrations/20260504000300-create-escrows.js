'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Escrows', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      contractId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Contracts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('HELD', 'PARTIALLY_RELEASED', 'RELEASED', 'REFUNDED'),
        defaultValue: 'HELD',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('Escrows', ['contractId'], {
      unique: true,
      name: 'escrows_contract_id_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Escrows');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Escrows_status";');
  },
};

