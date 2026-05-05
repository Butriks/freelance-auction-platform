'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Disputes', {
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
      openedByUserId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      reason: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('OPEN', 'RESOLVED', 'REJECTED'),
        defaultValue: 'OPEN',
      },
      adminComment: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      resolvedByAdminId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      resolvedAt: {
        allowNull: true,
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('Disputes', ['contractId'], {
      name: 'disputes_contract_id_idx',
    });
    await queryInterface.addIndex('Disputes', ['openedByUserId'], {
      name: 'disputes_opened_by_user_id_idx',
    });
    await queryInterface.addIndex('Disputes', ['status'], {
      name: 'disputes_status_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Disputes');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Disputes_status";');
  },
};

