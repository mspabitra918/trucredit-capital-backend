import { Model } from "sequelize-typescript";
export declare class Borrower extends Model<Borrower> {
    id: string;
    annualRevenue: number;
    businessName: string;
    businessAddress: string;
    businessCity: string;
    businessState: string;
    businessZip: string;
    ein: string;
    industry: string;
    ownerDOB: string;
    ownerEmail: string;
    ownerFirstName: string;
    ownerLastName: string;
    ownerPhone: string;
    ownerSSN: string;
    privacyConsent: boolean;
    requestedAmount: number;
    softPullConsent: string;
    timeInBusiness: string;
    pdfUrl: string;
}
