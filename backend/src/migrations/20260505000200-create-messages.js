'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Messages', {
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
      senderId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      text: {
        allowNull: false,
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex('Messages', ['contractId'], {
      name: 'messages_contract_id_idx',
    });
    await queryInterface.addIndex('Messages', ['senderId'], {
      name: 'messages_sender_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Messages');
  },
};

