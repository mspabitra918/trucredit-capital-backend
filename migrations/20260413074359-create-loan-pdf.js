"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("loan_applications", "pdfUrl", {
      allowNull: true,
      type: Sequelize.STRING,
      comment: "S3 URL of the uploaded PDF document",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("loan_applications", "pdfUrl");
  },
};
