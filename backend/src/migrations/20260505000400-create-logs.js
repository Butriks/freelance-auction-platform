'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      action: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      entityType: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      entityId: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      metadata: {
        allowNull: true,
        type: Sequelize.JSONB,
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

    await queryInterface.addIndex('Logs', ['userId'], {
      name: 'logs_user_id_idx',
    });
    await queryInterface.addIndex('Logs', ['action'], {
      name: 'logs_action_idx',
    });
    await queryInterface.addIndex('Logs', ['entityType'], {
      name: 'logs_entity_type_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Logs');
  },
};

