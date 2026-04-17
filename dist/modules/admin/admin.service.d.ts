import { JwtService } from "@nestjs/jwt";
import { Admin } from "./entities/admin.entity";
import { LoanService } from "../loan/loan.service";
import { UpdateLoanStatusDto } from "../loan/dto/update-loan-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { GenerateOfferDto } from "./dto/generate-offer.dto";
import { SendStipulationDto } from "./dto/send-stipulation.dto";
import { EmailService } from "../email/email.service";
import { BorrowerService } from "../borrower/borrower.service";
export declare class AdminService {
    private readonly adminModel;
    private readonly jwtService;
    private readonly loanService;
    private readonly emailService;
    private readonly borrowerService;
    private readonly logger;
    constructor(adminModel: typeof Admin, jwtService: JwtService, loanService: LoanService, emailService: EmailService, borrowerService: BorrowerService);
    onModuleInit(): Promise<void>;
    login(email: string, password: string): Promise<{
        message: string;
        data: {
            token: string;
            admin: {
                id: string;
                fullName: string;
                email: string;
            };
        };
    }>;
    listApplications(query: PaginationDto): Promise<{
        items: import("../loan/entities/loan-application.entity").LoanApplication[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getApplication(id: string): Promise<any>;
    updateApplicationStatus(id: string, dto: UpdateLoanStatusDto): Promise<import("../loan/entities/loan-application.entity").LoanApplication>;
    dashboardStats(): Promise<{
        total: number;
        newLead: number;
        underReview: number;
        stipsNeeded: number;
        offerSent: number;
        declined: number;
        funded: number;
    }>;
    sendStipulation(applicationId: string, dto: SendStipulationDto): Promise<import("../loan/entities/loan-application.entity").LoanApplication>;
    generateOffer(applicationId: string, dto: GenerateOfferDto): Promise<{
        application: import("../loan/entities/loan-application.entity").LoanApplication;
        termSheet: {
            applicationId: string;
            businessName: string;
            ownerName: string;
            offeredAmount: number;
            factorRate: number;
            totalPayback: number;
            paymentFrequency: "daily" | "weekly" | "bi-weekly" | "monthly";
            termMonths: number;
            estimatedPayment: number;
        };
    }>;
    private calculatePayment;
}
