'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Wallets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        allowNull: false,
        unique: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      balance: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      currency: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: 'USD',
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

    await queryInterface.addIndex('Wallets', ['userId'], {
      unique: true,
      name: 'wallets_user_id_unique',
    });

    await queryInterface.sequelize.query(`
      INSERT INTO "Wallets" ("userId", "balance", "currency", "createdAt", "updatedAt")
      SELECT
        "id",
        CASE WHEN "email" = 'client@test.com' THEN 5000 ELSE 0 END,
        'USD',
        NOW(),
        NOW()
      FROM "Users"
      ON CONFLICT ("userId") DO NOTHING;
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Wallets');
  },
};
