'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('loan_applications', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        allowNull: true,
        type: Sequelize.UUID,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      requestedAmount: { allowNull: false, type: Sequelize.DECIMAL(14, 2) },
      annualRevenue: { allowNull: false, type: Sequelize.DECIMAL(14, 2) },
      timeInBusiness: { allowNull: false, type: Sequelize.INTEGER },
      businessName: { allowNull: false, type: Sequelize.STRING },
      einEncrypted: { allowNull: true, type: Sequelize.TEXT },
      industry: { allowNull: false, type: Sequelize.STRING },
      businessAddress: { allowNull: true, type: Sequelize.STRING },
      businessCity: { allowNull: true, type: Sequelize.STRING },
      businessState: { allowNull: true, type: Sequelize.STRING(2) },
      businessZip: { allowNull: true, type: Sequelize.STRING(10) },
      ownerName: { allowNull: false, type: Sequelize.STRING },
      ssnEncrypted: { allowNull: true, type: Sequelize.TEXT },
      phone: { allowNull: false, type: Sequelize.STRING },
      email: { allowNull: false, type: Sequelize.STRING },
      dateOfBirth: { allowNull: true, type: Sequelize.DATEONLY },
      status: {
        allowNull: false,
        type: Sequelize.ENUM(
          'NEW_LEAD',
          'UNDER_REVIEW',
          'STIPS_NEEDED',
          'OFFER_SENT',
          'DECLINED',
          'FUNDED',
        ),
        defaultValue: 'NEW_LEAD',
      },
      adminNote: { allowNull: true, type: Sequelize.TEXT },
      offeredAmount: { allowNull: true, type: Sequelize.DECIMAL(14, 2) },
      factorRate: { allowNull: true, type: Sequelize.DECIMAL(6, 4) },
      paymentFrequency: { allowNull: true, type: Sequelize.STRING },
      termMonths: { allowNull: true, type: Sequelize.INTEGER },
      totalPayback: { allowNull: true, type: Sequelize.DECIMAL(14, 2) },
      tier: {
        allowNull: false,
        type: Sequelize.ENUM('express', 'high_limit'),
        defaultValue: 'express',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('loan_applications');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_loan_applications_status";',
    );
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_loan_applications_tier";',
    );
  },
};
