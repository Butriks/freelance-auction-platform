'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('WalletTransactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      walletId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Wallets',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      type: {
        allowNull: false,
        type: Sequelize.ENUM('MOCK_TOP_UP', 'ESCROW_HOLD', 'ESCROW_RELEASE', 'ESCROW_REFUND', 'ADMIN_ADJUSTMENT'),
      },
      direction: {
        allowNull: false,
        type: Sequelize.ENUM('CREDIT', 'DEBIT'),
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2),
      },
      balanceBefore: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2),
      },
      balanceAfter: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2),
      },
      currency: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: 'USD',
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('SUCCESS', 'FAILED'),
        defaultValue: 'SUCCESS',
      },
      contractId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Contracts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      milestoneId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Milestones',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      paymentId: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'Payments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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

    await queryInterface.addIndex('WalletTransactions', ['walletId'], {
      name: 'wallet_transactions_wallet_id_idx',
    });
    await queryInterface.addIndex('WalletTransactions', ['userId'], {
      name: 'wallet_transactions_user_id_idx',
    });
    await queryInterface.addIndex('WalletTransactions', ['type'], {
      name: 'wallet_transactions_type_idx',
    });
    await queryInterface.addIndex('WalletTransactions', ['contractId'], {
      name: 'wallet_transactions_contract_id_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('WalletTransactions');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_WalletTransactions_type";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_WalletTransactions_direction";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_WalletTransactions_status";');
  },
};
