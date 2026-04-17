import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

@Injectable()
export class CloudinaryService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>("CLOUDINARY_CLOUD_NAME"),
      api_key: this.configService.get<string>("CLOUDINARY_API_KEY"),
      api_secret: this.configService.get<string>("CLOUDINARY_API_SECRET"),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = "loan-documents",
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const baseName = (file.originalname || "document.pdf")
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "_");
      const publicId = `${Date.now()}-${baseName}`;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          format: "pdf",
          folder,
          public_id: publicId,
          use_filename: false,
          unique_filename: false,
          flags: "attachment:false",
        },
        (error, result) => {
          if (error) return reject(error);
          if (result) resolve(result);
        },
      );

      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null);
      bufferStream.pipe(uploadStream);
    });
  }
}
