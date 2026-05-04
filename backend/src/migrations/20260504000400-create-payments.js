'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
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
      fromUserId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      toUserId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM('DEPOSIT', 'RELEASE', 'REFUND'),
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('MOCK_SUCCESS', 'MOCK_FAILED'),
        defaultValue: 'MOCK_SUCCESS',
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

    await queryInterface.addIndex('Payments', ['contractId'], {
      name: 'payments_contract_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Payments');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Payments_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Payments_status";');
  },
};

