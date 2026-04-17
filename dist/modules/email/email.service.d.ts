import { ConfigService } from "@nestjs/config";
export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}
interface OfferDetails {
    offeredAmount: number;
    factorRate: number;
    paymentFrequency: string;
    termMonths: number;
    totalPayback: number;
    estimatedPayment: number;
}
export declare class EmailService {
    private readonly config;
    private readonly logger;
    private mailgun;
    private domain;
    constructor(config: ConfigService);
    private send;
    sendApplicationConfirmation(borrowerEmail: string, borrowerName: string, applicationId: string, requestedAmount: number): Promise<void>;
    sendHotLeadAlert(businessName: string, ownerName: string, requestedAmount: number, annualRevenue: number, industry: string, phone: string, email: string): Promise<void>;
    sendStatusUpdate(borrowerEmail: string, borrowerName: string, status: string, adminNote?: string, offerDetails?: OfferDetails): Promise<void>;
    sendStipulationRequest(borrowerEmail: string, borrowerName: string, missingItems: string[], applicationId: string): Promise<void>;
}
export {};
