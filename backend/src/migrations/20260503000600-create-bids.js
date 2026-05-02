'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Bids', {
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
      price: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      deliveryDays: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      comment: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED'),
        defaultValue: 'PENDING',
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

    await queryInterface.addIndex('Bids', ['taskId'], {
      name: 'bids_task_id_idx',
    });
    await queryInterface.addIndex('Bids', ['freelancerId'], {
      name: 'bids_freelancer_id_idx',
    });
    await queryInterface.addIndex('Bids', ['status'], {
      name: 'bids_status_idx',
    });
    await queryInterface.addIndex('Bids', ['taskId', 'freelancerId'], {
      unique: true,
      name: 'bids_task_id_freelancer_id_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Bids');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Bids_status";');
  },
};

