export declare class GenerateOfferDto {
    offeredAmount: number;
    factorRate: number;
    paymentFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
    termMonths: number;
}
