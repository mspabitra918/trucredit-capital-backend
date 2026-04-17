import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { LoanApplication } from '../../loan/entities/loan-application.entity';

export type DocType =
  | 'bank_statement'
  | 'tax_return'
  | 'profit_loss'
  | 'balance_sheet'
  | 'asset_appraisal'
  | 'id_document'
  | 'other';

@Table({ tableName: 'documents', timestamps: true })
export class Document extends Model<Document> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => LoanApplication)
  @Column({ type: DataType.UUID, allowNull: false })
  applicationId: string;

  @BelongsTo(() => LoanApplication)
  application: LoanApplication;

  @Column({ type: DataType.TEXT, allowNull: false })
  s3Key: string; // Path to file in S3

  @Column({ type: DataType.STRING, allowNull: false })
  originalFilename: string;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: 'application/pdf' })
  mimeType: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  fileSize: number; // bytes

  @Column({
    type: DataType.ENUM(
      'bank_statement',
      'tax_return',
      'profit_loss',
      'balance_sheet',
      'asset_appraisal',
      'id_document',
      'other',
    ),
    defaultValue: 'bank_statement',
  })
  docType: DocType;

  @Column({ type: DataType.STRING, allowNull: true })
  label: string; // e.g. "Month 1", "Month 2", "Q1 P&L"
}
