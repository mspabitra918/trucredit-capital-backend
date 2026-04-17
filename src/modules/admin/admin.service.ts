import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { Admin } from "./entities/admin.entity";
import { LoanService } from "../loan/loan.service";
import { UpdateLoanStatusDto } from "../loan/dto/update-loan-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { GenerateOfferDto } from "./dto/generate-offer.dto";
import { SendStipulationDto } from "./dto/send-stipulation.dto";
import { EmailService } from "../email/email.service";
import { BorrowerService } from "../borrower/borrower.service";
import { decrypt } from "../../common/utils/encryption.util";

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(Admin) private readonly adminModel: typeof Admin,
    private readonly jwtService: JwtService,
    private readonly loanService: LoanService,
    private readonly emailService: EmailService,
    private readonly borrowerService: BorrowerService,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.adminModel.count();
      if (count === 0) {
        const password = await bcrypt.hash("Admin@123", 10);
        await this.adminModel.create({
          fullName: "Super Admin",
          email: "admin@businessloan.com",
          password,
        } as any);
        this.logger.log(
          "Default admin created -> admin@businessloan.com / Admin@123",
        );
      }
    } catch (err) {
      this.logger.error("Failed to seed default admin", err as any);
    }
  }

  async login(email: string, password: string) {
    try {
      const admin = await this.adminModel.findOne({ where: { email } });
      if (!admin) throw new UnauthorizedException("Invalid credentials");

      const valid = await bcrypt.compare(password, admin.password);
      if (!valid) throw new UnauthorizedException("Invalid credentials");

      const token = this.jwtService.sign({
        sub: admin.id,
        email: admin.email,
        role: "admin",
      });

      return {
        message: "Admin login successful",
        data: {
          token,
          admin: {
            id: admin.id,
            fullName: admin.fullName,
            email: admin.email,
          },
        },
      };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.error("AdminService.login failed", err as any);
      throw new InternalServerErrorException("Login failed");
    }
  }

  async listApplications(query: PaginationDto) {
    return this.loanService.findAll(query);
  }

  async getApplication(id: string) {
    const application = await this.loanService.findOne(id);
    const plain = application.toJSON() as any;
    try {
      plain.ein = plain.einEncrypted ? decrypt(plain.einEncrypted) : null;
    } catch {
      plain.ein = null;
    }
    try {
      plain.ssn = plain.ssnEncrypted ? decrypt(plain.ssnEncrypted) : null;
    } catch {
      plain.ssn = null;
    }
    return plain;
  }

  async updateApplicationStatus(id: string, dto: UpdateLoanStatusDto) {
    return this.loanService.updateStatus(id, dto);
  }

  async dashboardStats() {
    return this.loanService.stats();
  }

  // ── Stipulation Engine ─────────────────────────────────────────
  async sendStipulation(applicationId: string, dto: SendStipulationDto) {
    const application = await this.loanService.findOne(applicationId);

    // Update status to STIPS_NEEDED
    application.status = "STIPS_NEEDED";
    application.adminNote = `Documents requested: ${dto.missingItems.join(", ")}`;
    await application.save();

    // Send stipulation email to borrower
    await this.emailService.sendStipulationRequest(
      application.email,
      application.ownerName,
      dto.missingItems,
      applicationId,
    );

    return application;
  }

  // ── Offer Generator ────────────────────────────────────────────
  async generateOffer(applicationId: string, dto: GenerateOfferDto) {
    const application = await this.loanService.findOne(applicationId);

    // Calculate total payback: offeredAmount * factorRate
    const totalPayback = Number(
      (dto.offeredAmount * dto.factorRate).toFixed(2),
    );

    // Save offer details on the application
    application.offeredAmount = dto.offeredAmount;
    application.factorRate = dto.factorRate;
    application.paymentFrequency = dto.paymentFrequency;
    application.termMonths = dto.termMonths;
    application.totalPayback = totalPayback;
    application.status = "OFFER_SENT";
    await application.save();

    const estimatedPayment = this.calculatePayment(
      totalPayback,
      dto.termMonths,
      dto.paymentFrequency,
    );

    // Notify borrower that an offer is ready
    await this.emailService.sendStatusUpdate(
      application.email,
      application.ownerName,
      "OFFER_SENT",
      undefined,
      {
        offeredAmount: dto.offeredAmount,
        factorRate: dto.factorRate,
        paymentFrequency: dto.paymentFrequency,
        termMonths: dto.termMonths,
        totalPayback,
        estimatedPayment,
      },
    );

    // Build a term sheet summary
    const termSheet = {
      applicationId: application.id,
      businessName: application.businessName,
      ownerName: application.ownerName,
      offeredAmount: dto.offeredAmount,
      factorRate: dto.factorRate,
      totalPayback,
      paymentFrequency: dto.paymentFrequency,
      termMonths: dto.termMonths,
      estimatedPayment,
    };

    return { application, termSheet };
  }

  private calculatePayment(
    totalPayback: number,
    termMonths: number,
    frequency: string,
  ): number {
    let totalPayments: number;
    switch (frequency) {
      case "daily":
        totalPayments = termMonths * 22; // ~22 business days/month
        break;
      case "weekly":
        totalPayments = termMonths * 4.33;
        break;
      case "bi-weekly":
        totalPayments = termMonths * 2.17;
        break;
      case "monthly":
      default:
        totalPayments = termMonths;
        break;
    }
    return Number((totalPayback / totalPayments).toFixed(2));
  }
}
