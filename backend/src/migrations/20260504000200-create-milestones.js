'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Milestones', {
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
      title: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(10, 2),
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('PENDING', 'SUBMITTED', 'APPROVED', 'REJECTED'),
        defaultValue: 'PENDING',
      },
      dueDate: {
        allowNull: true,
        type: Sequelize.DATEONLY,
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

    await queryInterface.addIndex('Milestones', ['contractId'], {
      name: 'milestones_contract_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Milestones');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Milestones_status";');
  },
};

