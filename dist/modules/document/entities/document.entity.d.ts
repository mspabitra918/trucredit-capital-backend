import { Model } from 'sequelize-typescript';
import { LoanApplication } from '../../loan/entities/loan-application.entity';
export type DocType = 'bank_statement' | 'tax_return' | 'profit_loss' | 'balance_sheet' | 'asset_appraisal' | 'id_document' | 'other';
export declare class Document extends Model<Document> {
    id: string;
    applicationId: string;
    application: LoanApplication;
    s3Key: string;
    originalFilename: string;
    mimeType: string;
    fileSize: number;
    docType: DocType;
    label: string;
}
