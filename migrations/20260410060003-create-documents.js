'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('documents', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      applicationId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: { model: 'loan_applications', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      s3Key: { allowNull: false, type: Sequelize.TEXT },
      originalFilename: { allowNull: false, type: Sequelize.STRING },
      mimeType: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: 'application/pdf',
      },
      fileSize: { allowNull: true, type: Sequelize.INTEGER },
      docType: {
        allowNull: false,
        type: Sequelize.ENUM(
          'bank_statement',
          'tax_return',
          'profit_loss',
          'balance_sheet',
          'asset_appraisal',
          'id_document',
          'other',
        ),
        defaultValue: 'bank_statement',
      },
      label: { allowNull: true, type: Sequelize.STRING },
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
    await queryInterface.dropTable('documents');
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_documents_docType";',
    );
  },
};
