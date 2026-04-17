import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Borrower } from "./entities/borrower.entity";
import { S3Service } from "../s3/s3.service";
import { EmailService } from "../email/email.service";
import { application } from "express";
import { encrypt } from "src/common/utils/encryption.util";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Op } from "sequelize/lib/operators";
import { LoanApplication } from "../loan/entities/loan-application.entity";

@Injectable()
export class BorrowerService {
  constructor(
    @InjectModel(Borrower)
    private readonly borrowerModel: typeof Borrower,
    private readonly emailService: EmailService,
    private readonly logger: Logger,
    private readonly s3Service: S3Service,
  ) {}

  async create(data: Partial<Borrower>): Promise<Borrower> {
    const {
      annualRevenue,
      businessAddress,
      businessCity,
      businessName,
      businessState,
      businessZip,
      ein,
      industry,
      ownerDOB,
      ownerEmail,
      ownerFirstName,
      ownerLastName,
      ownerPhone,
      ownerSSN,
      privacyConsent,
      requestedAmount,
      softPullConsent,
      timeInBusiness,
      pdfUrl,
    } = data;
    const einEncrypted = ein ? encrypt(ein) : null;
    const ssnEncrypted = ownerSSN ? encrypt(ownerSSN) : null;
    const borrower = await this.borrowerModel.create({
      annualRevenue,
      businessAddress,
      businessCity,
      businessName,
      businessState,
      businessZip,
      ein: einEncrypted,
      industry,
      ownerDOB,
      ownerEmail,
      ownerFirstName,
      ownerLastName,
      ownerPhone,
      ownerSSN: ssnEncrypted,
      privacyConsent,
      requestedAmount,
      softPullConsent,
      timeInBusiness,
      pdfUrl,
    });
    // Trigger emails (non-blocking)
    await this.emailService
      .sendApplicationConfirmation(
        data.ownerEmail,
        `${data.ownerFirstName} ${data.ownerLastName}`,
        String(borrower.id),
        data.requestedAmount,
      )
      .catch((err) =>
        this.logger.error("Confirmation email failed", err as any),
      );

    await this.emailService
      .sendHotLeadAlert(
        data.businessName,
        `${data.ownerFirstName} ${data.ownerLastName}`,
        data.requestedAmount,
        data.annualRevenue,
        data.industry,
        data.ownerPhone,
        data.ownerEmail,
      )
      .catch((err) =>
        this.logger.error("Hot lead alert email failed", err as any),
      );
    return borrower;
  }

  async findAll(query: PaginationDto) {
    try {
      const page = query.page ?? 1;
      const limit = query.limit ?? 10;
      const offset = (page - 1) * limit;

      const where: any = {};
      if (query.search) {
        where[Op.or] = [
          { ownerName: { [Op.iLike]: `%${query.search}%` } },
          { email: { [Op.iLike]: `%${query.search}%` } },
          { businessName: { [Op.iLike]: `%${query.search}%` } },
        ];
      }

      const { rows, count } = await this.borrowerModel.findAndCountAll({
        where,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        // include: [{ as: "documents" }],
      });

      return {
        items: rows,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      };
    } catch (err) {
      this.logger.error("BorrowerService.findAll failed", err as any);
      throw new InternalServerErrorException("Failed to fetch borrowers");
    }
  }

  async findOne(id: string): Promise<Borrower> {
    try {
      const application = await this.borrowerModel.findByPk(id, {
        // include: [{ model: Document, as: "documents" }],
      });
      if (!application) throw new NotFoundException("Application not found");
      return application;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error("BorrowerService.findOne failed", err as any);
      throw new InternalServerErrorException("Lookup failed");
    }
  }

  async findById(id: string): Promise<Borrower> {
    const borrower = await this.borrowerModel.findByPk(id);
    if (!borrower) {
      throw new NotFoundException(`Borrower #${id} not found`);
    }
    return borrower;
  }

  async uploadPdf(file: Express.Multer.File): Promise<{ pdfUrl: string }> {
    const { s3Key } = await this.s3Service.uploadFile(file);

    const pdfUrl = `https://${process.env.AWS_S3_BUCKET || "trucredit-documents"}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${s3Key}`;

    return { pdfUrl };
  }

  async getPdfPresignedUrl(id: string): Promise<string> {
    const borrower = await this.findById(id);
    if (!borrower.pdfUrl) {
      throw new NotFoundException(`No PDF uploaded for borrower #${id}`);
    }

    // Extract S3 key from the full URL
    const url = new URL(borrower.pdfUrl);
    const s3Key = url.pathname.substring(1); // remove leading "/"

    return this.s3Service.getPresignedUrl(s3Key);
  }
}
