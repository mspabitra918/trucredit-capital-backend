import { Document, DocType } from './entities/document.entity';
import { S3Service } from '../s3/s3.service';
export declare class DocumentService {
    private readonly docModel;
    private readonly s3Service;
    private readonly logger;
    constructor(docModel: typeof Document, s3Service: S3Service);
    upload(file: Express.Multer.File, applicationId: string, docType?: DocType, label?: string): Promise<Document>;
    findByApplication(applicationId: string): Promise<Document[]>;
    getPresignedUrl(docId: string): Promise<string>;
    delete(docId: string): Promise<void>;
    deleteByApplication(applicationId: string): Promise<number>;
}
