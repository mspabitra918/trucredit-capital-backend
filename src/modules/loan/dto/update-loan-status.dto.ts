import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateLoanStatusDto {
  @IsIn([
    'NEW_LEAD',
    'UNDER_REVIEW',
    'STIPS_NEEDED',
    'OFFER_SENT',
    'DECLINED',
    'FUNDED',
  ])
  status:
    | 'NEW_LEAD'
    | 'UNDER_REVIEW'
    | 'STIPS_NEEDED'
    | 'OFFER_SENT'
    | 'DECLINED'
    | 'FUNDED';

  @IsOptional()
  @IsString()
  adminNote?: string;
}
