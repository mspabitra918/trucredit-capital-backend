import { BorrowerService } from "./borrower.service";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
export declare class BorrowerController {
    private readonly borrowerService;
    private readonly cloudinaryService;
    constructor(borrowerService: BorrowerService, cloudinaryService: CloudinaryService);
    uploadPdfCloudinary(file: Express.Multer.File): Promise<{
        message: string;
        pdfUrl: string;
    }>;
}
