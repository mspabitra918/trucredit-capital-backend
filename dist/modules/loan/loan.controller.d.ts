import { LoanService } from "./loan.service";
import { CreateLoanDto } from "./dto/create-loan.dto";
export declare class LoanController {
    private readonly loanService;
    constructor(loanService: LoanService);
    apply(dto: CreateLoanDto, req: any): Promise<{
        message: string;
        data: {
            id: string;
            status: import("./entities/loan-application.entity").LoanStatus;
            tier: "express" | "high_limit";
        };
    }>;
}
