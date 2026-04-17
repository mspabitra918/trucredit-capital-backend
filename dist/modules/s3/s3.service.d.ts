import { ConfigService } from '@nestjs/config';
export declare class S3Service {
    private readonly config;
    private readonly logger;
    private readonly s3;
    private readonly bucket;
    constructor(config: ConfigService);
    uploadFile(file: Express.Multer.File, applicationId?: string): Promise<{
        s3Key: string;
    }>;
    getPresignedUrl(s3Key: string): Promise<string>;
    deleteFile(s3Key: string): Promise<void>;
}
