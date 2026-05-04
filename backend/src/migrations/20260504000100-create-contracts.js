'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Contracts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      taskId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Tasks',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      freelancerId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'FreelancerProfiles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      acceptedBidId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Bids',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      totalAmount: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('ACTIVE', 'COMPLETED', 'CANCELLED', 'DISPUTED'),
        defaultValue: 'ACTIVE',
      },
      startedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      completedAt: {
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

    await queryInterface.addIndex('Contracts', ['taskId'], {
      unique: true,
      name: 'contracts_task_id_unique',
    });
    await queryInterface.addIndex('Contracts', ['clientId'], {
      name: 'contracts_client_id_idx',
    });
    await queryInterface.addIndex('Contracts', ['freelancerId'], {
      name: 'contracts_freelancer_id_idx',
    });
    await queryInterface.addIndex('Contracts', ['status'], {
      name: 'contracts_status_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Contracts');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Contracts_status";');
  },
};

