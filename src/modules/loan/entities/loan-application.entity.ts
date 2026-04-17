import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import { User } from "../../user/entities/user.entity";
import { Document } from "../../document/entities/document.entity";

export type LoanStatus =
  | "NEW_LEAD"
  | "UNDER_REVIEW"
  | "STIPS_NEEDED"
  | "OFFER_SENT"
  | "DECLINED"
  | "FUNDED";

@Table({ tableName: "loan_applications", timestamps: true })
export class LoanApplication extends Model<LoanApplication> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  userId: string | null;

  @BelongsTo(() => User)
  user: User;

  // ── Step 1: Qualifier ──────────────────────────────────────────
  @Column({ type: DataType.DECIMAL(14, 2), allowNull: false })
  requestedAmount: number;

  @Column({ type: DataType.DECIMAL(14, 2), allowNull: false })
  annualRevenue: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  timeInBusiness: number; // months

  // ── Step 2: Business Profile ───────────────────────────────────
  @Column({ type: DataType.STRING, allowNull: false })
  businessName: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  einEncrypted: string | null; // AES-256-GCM encrypted

  @Column({ type: DataType.STRING, allowNull: false })
  industry: string;

  @Column({ type: DataType.STRING, allowNull: true })
  businessAddress: string;

  @Column({ type: DataType.STRING, allowNull: true })
  businessCity: string;

  @Column({ type: DataType.STRING(2), allowNull: true })
  businessState: string;

  @Column({ type: DataType.STRING(10), allowNull: true })
  businessZip: string;

  // ── Step 3: Documents (relation) ───────────────────────────────
  @HasMany(() => Document)
  documents: Document[];

  // ── Step 4: Personal Profile (Owner) ───────────────────────────
  @Column({ type: DataType.STRING, allowNull: false })
  ownerName: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  ssnEncrypted: string | null; // AES-256-GCM encrypted — "Soft Pull Only"

  @Column({ type: DataType.STRING, allowNull: false })
  phone: string;

  @Column({ type: DataType.STRING, allowNull: false })
  email: string;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  dateOfBirth: string;

  // ── Pipeline Status ────────────────────────────────────────────
  @Column({
    type: DataType.ENUM(
      "NEW_LEAD",
      "UNDER_REVIEW",
      "STIPS_NEEDED",
      "OFFER_SENT",
      "DECLINED",
      "FUNDED",
    ),
    defaultValue: "NEW_LEAD",
  })
  status: LoanStatus;

  @Column({ type: DataType.TEXT, allowNull: true })
  adminNote: string | null;

  // ── Offer fields (populated by admin Offer Generator) ──────────
  @Column({ type: DataType.DECIMAL(14, 2), allowNull: true })
  offeredAmount: number | null;

  @Column({ type: DataType.DECIMAL(6, 4), allowNull: true })
  factorRate: number | null;

  @Column({ type: DataType.STRING, allowNull: true })
  paymentFrequency: string | null; // daily, weekly, bi-weekly, monthly

  @Column({ type: DataType.INTEGER, allowNull: true })
  termMonths: number | null;

  @Column({ type: DataType.DECIMAL(14, 2), allowNull: true })
  totalPayback: number | null;

  // ── Conditional routing ────────────────────────────────────────
  @Column({
    type: DataType.ENUM("express", "high_limit"),
    defaultValue: "express",
  })
  tier: "express" | "high_limit"; // express < $500k, high_limit >= $500k

  @Column({ type: DataType.STRING, allowNull: true })
  pdfUrl: string | null;
}
