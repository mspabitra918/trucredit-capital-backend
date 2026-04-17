import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export class GenerateOfferDto {
  @IsNumber()
  @Min(5000)
  offeredAmount: number;

  @IsNumber()
  @Min(1)
  factorRate: number; // e.g. 1.15, 1.25, 1.35

  @IsEnum(['daily', 'weekly', 'bi-weekly', 'monthly'])
  paymentFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';

  @IsNumber()
  @Min(1)
  termMonths: number;
}
