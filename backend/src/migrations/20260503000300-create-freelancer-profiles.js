'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FreelancerProfiles', {
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
      firstName: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      lastName: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      bio: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      hourlyRate: {
        allowNull: true,
        type: Sequelize.DECIMAL(10, 2),
      },
      rating: {
        allowNull: false,
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0,
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

    await queryInterface.addIndex('FreelancerProfiles', ['userId'], {
      unique: true,
      name: 'freelancer_profiles_user_id_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('FreelancerProfiles');
  },
};

