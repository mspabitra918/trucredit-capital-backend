import { Logger } from "@nestjs/common";
import { Borrower } from "./entities/borrower.entity";
import { S3Service } from "../s3/s3.service";
import { EmailService } from "../email/email.service";
import { PaginationDto } from "src/common/dto/pagination.dto";
export declare class BorrowerService {
    private readonly borrowerModel;
    private readonly emailService;
    private readonly logger;
    private readonly s3Service;
    constructor(borrowerModel: typeof Borrower, emailService: EmailService, logger: Logger, s3Service: S3Service);
    create(data: Partial<Borrower>): Promise<Borrower>;
    findAll(query: PaginationDto): Promise<{
        items: Borrower[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Borrower>;
    findById(id: string): Promise<Borrower>;
    uploadPdf(file: Express.Multer.File): Promise<{
        pdfUrl: string;
    }>;
    getPdfPresignedUrl(id: string): Promise<string>;
}
