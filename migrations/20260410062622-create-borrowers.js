"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.createTable("borrowers", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      annualRevenue: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      businessAddress: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      businessCity: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      businessName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      businessState: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      businessZip: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      ein: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      industry: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      ownerDOB: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      ownerEmail: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      ownerFirstName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      ownerLastName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      ownerPhone: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      ownerSSN: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      privacyConsent: {
        allowNull: true,
        type: Sequelize.BOOLEAN,
      },
      requestedAmount: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      softPullConsent: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      timeInBusiness: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      pdfUrl: {
        allowNull: true,
        type: Sequelize.STRING,
        comment: "S3 URL of the uploaded PDF document",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("borrowers");
  },
};
