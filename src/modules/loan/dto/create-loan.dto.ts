import {
  IsDateString,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from "class-validator";

export class CreateLoanDto {
  // ── Step 1: Qualifier ──────────────────────────────────────────
  @IsNumber()
  @Min(5000)
  @Max(1000000)
  requestedAmount: number;

  @IsNumber()
  @Min(0)
  annualRevenue: number;

  @IsInt()
  @Min(0)
  timeInBusiness: number; // months

  // ── Step 2: Business Profile ───────────────────────────────────
  @IsString()
  @MinLength(2)
  businessName: string;

  @IsOptional()
  @IsString()
  ein?: string; // Will be encrypted server-side

  @IsString()
  industry: string;

  @IsOptional()
  @IsString()
  businessAddress?: string;

  @IsOptional()
  @IsString()
  businessCity?: string;

  @IsOptional()
  @IsString()
  businessState?: string;

  @IsOptional()
  @IsString()
  businessZip?: string;

  // ── Step 4: Personal Profile (Owner) ───────────────────────────
  @IsString()
  ownerLastName: string;

  @IsString()
  ownerFirstName: string;

  @IsOptional()
  @IsString()
  ownerSSN?: string; // Will be encrypted server-side — "Soft Pull Only"

  @IsString()
  ownerPhone: string;

  @IsEmail()
  ownerEmail: string;

  @IsOptional()
  @IsDateString()
  ownerDOB?: string;

  @IsOptional()
  @IsString()
  pdfUrl?: string;
}
