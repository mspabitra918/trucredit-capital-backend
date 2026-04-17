import { LoanApplication } from "./entities/loan-application.entity";
import { Document } from "../document/entities/document.entity";
import { CreateLoanDto } from "./dto/create-loan.dto";
import { UpdateLoanStatusDto } from "./dto/update-loan-status.dto";
import { PaginationDto } from "../../common/dto/pagination.dto";
import { EmailService } from "../email/email.service";
export declare class LoanService {
    private readonly loanModel;
    private readonly documentModel;
    private readonly emailService;
    private readonly logger;
    constructor(loanModel: typeof LoanApplication, documentModel: typeof Document, emailService: EmailService);
    create(dto: CreateLoanDto, userId?: string): Promise<LoanApplication>;
    findAll(query: PaginationDto): Promise<{
        items: LoanApplication[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<LoanApplication>;
    findMine(userId: string): Promise<LoanApplication[]>;
    updateStatus(id: string, dto: UpdateLoanStatusDto): Promise<LoanApplication>;
    stats(): Promise<{
        total: number;
        newLead: number;
        underReview: number;
        stipsNeeded: number;
        offerSent: number;
        declined: number;
        funded: number;
    }>;
}
