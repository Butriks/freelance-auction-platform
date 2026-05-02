'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      clientId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'ClientProfiles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      categoryId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Categories',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      description: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      budget: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      deadline: {
        allowNull: false,
        type: Sequelize.DATEONLY,
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
        defaultValue: 'OPEN',
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

    await queryInterface.addIndex('Tasks', ['clientId'], {
      name: 'tasks_client_id_idx',
    });
    await queryInterface.addIndex('Tasks', ['categoryId'], {
      name: 'tasks_category_id_idx',
    });
    await queryInterface.addIndex('Tasks', ['status'], {
      name: 'tasks_status_idx',
    });
    await queryInterface.addIndex('Tasks', ['deadline'], {
      name: 'tasks_deadline_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Tasks');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Tasks_status";');
  },
};

