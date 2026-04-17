export declare class UpdateLoanStatusDto {
    status: 'NEW_LEAD' | 'UNDER_REVIEW' | 'STIPS_NEEDED' | 'OFFER_SENT' | 'DECLINED' | 'FUNDED';
    adminNote?: string;
}
