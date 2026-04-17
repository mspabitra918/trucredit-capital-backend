import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { BorrowerService } from "./borrower.service";
import { Borrower } from "./entities/borrower.entity";
import { CloudinaryService } from "../cloudinary/cloudinary.service";

@Controller("borrowers")
export class BorrowerController {
  constructor(
    private readonly borrowerService: BorrowerService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // @Post("apply")
  // async create(@Body() body: Partial<Borrower>): Promise<Borrower> {
  //   return this.borrowerService.create(body);
  // }

  // @Post("upload-pdf")
  // @UseInterceptors(
  //   FileInterceptor("file", {
  //     limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  //     fileFilter: (_req, file, cb) => {
  //       if (file.mimetype !== "application/pdf") {
  //         return cb(new Error("Only PDF files are allowed"), false);
  //       }
  //       cb(null, true);
  //     },
  //   }),
  // )
  // async uploadPdf(
  //   @UploadedFile() file: Express.Multer.File,
  // ): Promise<{ message: string; pdfUrl: string }> {
  //   const { pdfUrl } = await this.borrowerService.uploadPdf(file);
  //   return {
  //     message: "PDF uploaded successfully",
  //     pdfUrl,
  //   };
  // }

  @Post("upload-pdf-cloudinary")
  @UseInterceptors(FileInterceptor("file"))
  async uploadPdfCloudinary(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error("File not provided");
    }

    const result = await this.cloudinaryService.uploadFile(file);

    return {
      message: "Uploaded successfully",
      pdfUrl: result.secure_url,
    };
  }

  // @Get(":id/pdf")
  // async getPdfUrl(
  //   @Param("id", ParseUUIDPipe) id: string,
  // ): Promise<{ url: string }> {
  //   const url = await this.borrowerService.getPdfPresignedUrl(id);
  //   return { url };
  // }
}
