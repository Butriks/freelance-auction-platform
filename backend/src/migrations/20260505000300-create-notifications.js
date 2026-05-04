'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Notifications', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      message: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM(
          'NEW_BID',
          'BID_ACCEPTED',
          'CONTRACT_CREATED',
          'MILESTONE_SUBMITTED',
          'MILESTONE_APPROVED',
          'MILESTONE_REJECTED',
          'CONTRACT_COMPLETED',
          'NEW_MESSAGE',
          'REVIEW_CREATED',
          'SYSTEM',
        ),
      },
      isRead: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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

    await queryInterface.addIndex('Notifications', ['userId'], {
      name: 'notifications_user_id_idx',
    });
    await queryInterface.addIndex('Notifications', ['type'], {
      name: 'notifications_type_idx',
    });
    await queryInterface.addIndex('Notifications', ['isRead'], {
      name: 'notifications_is_read_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Notifications');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Notifications_type";');
  },
};

