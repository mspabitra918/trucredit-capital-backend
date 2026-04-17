import { DocumentService } from './document.service';
import { DocType } from './entities/document.entity';
export declare class DocumentController {
    private readonly documentService;
    constructor(documentService: DocumentService);
    uploadOne(applicationId: string, file: Express.Multer.File, docType?: DocType, label?: string): Promise<{
        message: string;
        data: import("./entities/document.entity").Document;
    }>;
    uploadMultiple(applicationId: string, files: Express.Multer.File[], docType?: DocType): Promise<{
        message: string;
        data: import("./entities/document.entity").Document[];
    }>;
    listByApplication(applicationId: string): Promise<{
        message: string;
        data: import("./entities/document.entity").Document[];
    }>;
    getViewUrl(id: string): Promise<{
        message: string;
        data: {
            url: string;
        };
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    removeByApplication(applicationId: string): Promise<{
        message: string;
        data: {
            count: number;
        };
    }>;
}
