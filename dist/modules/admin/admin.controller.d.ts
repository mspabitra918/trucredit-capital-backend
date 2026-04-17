import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UpdateLoanStatusDto } from '../loan/dto/update-loan-status.dto';
import { SendStipulationDto } from './dto/send-stipulation.dto';
import { GenerateOfferDto } from './dto/generate-offer.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    login(dto: AdminLoginDto): Promise<{
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
    stats(): Promise<{
        message: string;
        data: {
            total: number;
            newLead: number;
            underReview: number;
            stipsNeeded: number;
            offerSent: number;
            declined: number;
            funded: number;
        };
    }>;
    listApplications(query: PaginationDto): Promise<{
        message: string;
        data: {
            items: import("../loan/entities/loan-application.entity").LoanApplication[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getApplication(id: string): Promise<{
        message: string;
        data: any;
    }>;
    updateStatus(id: string, dto: UpdateLoanStatusDto): Promise<{
        message: string;
        data: import("../loan/entities/loan-application.entity").LoanApplication;
    }>;
    sendStipulation(id: string, dto: SendStipulationDto): Promise<{
        message: string;
        data: import("../loan/entities/loan-application.entity").LoanApplication;
    }>;
    generateOffer(id: string, dto: GenerateOfferDto): Promise<{
        message: string;
        data: {
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
        };
    }>;
}
