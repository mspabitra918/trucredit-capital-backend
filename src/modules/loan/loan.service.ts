import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Op } from "sequelize";
import { LoanApplication } from "./entities/loan-application.entity";
import { Document } from "../document/entities/document.entity";
import { CreateLoanDto } from "./dto/create-loan.dto";
import { UpdateLoanStatusDto } from "./dto/update-loan-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { encrypt } from "../../common/utils/encryption.util";
import { EmailService } from "../email/email.service";

@Injectable()
export class LoanService {
  private readonly logger = new Logger(LoanService.name);

  constructor(
    @InjectModel(LoanApplication)
    private readonly loanModel: typeof LoanApplication,
    @InjectModel(Document)
    private readonly documentModel: typeof Document,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateLoanDto, userId?: string): Promise<LoanApplication> {
    try {
      // Encrypt sensitive PII before storage
      const einEncrypted = dto.ein ? encrypt(dto.ein) : null;
      const ssnEncrypted = dto.ownerSSN ? encrypt(dto.ownerSSN) : null;

      // Determine tier: express < $500k, high_limit >= $500k
      const tier = dto.requestedAmount >= 500000 ? "high_limit" : "express";

      const application = await this.loanModel.create({
        userId: userId ?? null,
        requestedAmount: dto.requestedAmount,
        annualRevenue: dto.annualRevenue,
        timeInBusiness: dto.timeInBusiness,
        businessName: dto.businessName,
        einEncrypted,
        industry: dto.industry,
        businessAddress: dto.businessAddress || null,
        businessCity: dto.businessCity || null,
        businessState: dto.businessState || null,
        businessZip: dto.businessZip || null,
        ownerName: `${dto.ownerFirstName} ${dto.ownerLastName}`.trim(),
        ssnEncrypted,
        phone: dto.ownerPhone,
        email: dto.ownerEmail,
        dateOfBirth: dto.ownerDOB || null,
        status: "NEW_LEAD",
        tier,
        pdfUrl: dto.pdfUrl ?? null,
      } as any);

      // Trigger emails (non-blocking)
      this.emailService
        .sendApplicationConfirmation(
          dto.ownerEmail,
          `${dto.ownerFirstName} ${dto.ownerLastName}`,
          application.id,
          dto.requestedAmount,
        )
        .catch((err) =>
          this.logger.error("Confirmation email failed", err as any),
        );

      this.emailService
        .sendHotLeadAlert(
          dto.businessName,
          `${dto.ownerFirstName} ${dto.ownerLastName}`,
          dto.requestedAmount,
          dto.annualRevenue,
          dto.industry,
          dto.ownerPhone,
          dto.ownerEmail,
        )
        .catch((err) =>
          this.logger.error("Hot lead alert email failed", err as any),
        );

      return application;
    } catch (err) {
      this.logger.error("LoanService.create failed", err as any);
      throw new InternalServerErrorException(
        "Could not submit loan application",
      );
    }
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

      if (query.date) {
        where.createdAt = {
          [Op.gte]: new Date(query.date),
          [Op.lt]: new Date(new Date(query.date).getTime() + 86400000),
        };
      }

      const { rows, count } = await this.loanModel.findAndCountAll({
        where,
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        include: [{ model: Document, as: "documents" }],
      });

      return {
        items: rows,
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      };
    } catch (err) {
      this.logger.error("LoanService.findAll failed", err as any);
      throw new InternalServerErrorException("Failed to fetch applications");
    }
  }

  async findOne(id: string): Promise<LoanApplication> {
    try {
      const application = await this.loanModel.findByPk(id, {
        include: [{ model: Document, as: "documents" }],
      });
      if (!application) throw new NotFoundException("Application not found");
      return application;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error("LoanService.findOne failed", err as any);
      throw new InternalServerErrorException("Lookup failed");
    }
  }

  async findMine(userId: string) {
    try {
      return await this.loanModel.findAll({
        where: { userId },
        order: [["createdAt", "DESC"]],
        include: [{ model: Document, as: "documents" }],
      });
    } catch (err) {
      this.logger.error("LoanService.findMine failed", err as any);
      throw new InternalServerErrorException("Lookup failed");
    }
  }

  async updateStatus(id: string, dto: UpdateLoanStatusDto) {
    try {
      const application = await this.findOne(id);
      application.status = dto.status;
      if (dto.adminNote !== undefined) application.adminNote = dto.adminNote;
      await application.save();

      // Send status update email to borrower (non-blocking)
      this.emailService
        .sendStatusUpdate(
          application.email,
          application.ownerName,
          dto.status,
          dto.adminNote,
        )
        .catch((err) =>
          this.logger.error("Status update email failed", err as any),
        );

      return application;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error("LoanService.updateStatus failed", err as any);
      throw new InternalServerErrorException("Could not update status");
    }
  }

  async stats() {
    try {
      const [
        total,
        newLead,
        underReview,
        stipsNeeded,
        offerSent,
        declined,
        funded,
      ] = await Promise.all([
        this.loanModel.count(),
        this.loanModel.count({ where: { status: "NEW_LEAD" } }),
        this.loanModel.count({ where: { status: "UNDER_REVIEW" } }),
        this.loanModel.count({ where: { status: "STIPS_NEEDED" } }),
        this.loanModel.count({ where: { status: "OFFER_SENT" } }),
        this.loanModel.count({ where: { status: "DECLINED" } }),
        this.loanModel.count({ where: { status: "FUNDED" } }),
      ]);
      return {
        total,
        newLead,
        underReview,
        stipsNeeded,
        offerSent,
        declined,
        funded,
      };
    } catch (err) {
      this.logger.error("LoanService.stats failed", err as any);
      throw new InternalServerErrorException("Could not load stats");
    }
  }
}
