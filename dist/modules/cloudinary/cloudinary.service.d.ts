import { ConfigService } from "@nestjs/config";
import { UploadApiResponse } from "cloudinary";
export declare class CloudinaryService {
    private configService;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, folder?: string): Promise<UploadApiResponse>;
}
