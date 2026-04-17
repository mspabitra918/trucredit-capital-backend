import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({ tableName: "borrowers", timestamps: true })
export class Borrower extends Model<Borrower> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  annualRevenue: number;

  @Column({ type: DataType.STRING, allowNull: false })
  businessName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  businessAddress: string;

  @Column({ type: DataType.STRING, allowNull: false })
  businessCity: string;

  @Column({ type: DataType.STRING, allowNull: false })
  businessState: string;

  @Column({ type: DataType.STRING, allowNull: false })
  businessZip: string;

  @Column({ type: DataType.STRING, allowNull: false })
  ein: string;

  @Column({ type: DataType.STRING, allowNull: false })
  industry: string;

  @Column({ type: DataType.STRING, allowNull: false })
  ownerDOB: string;

  @Column({ type: DataType.STRING, allowNull: false })
  ownerEmail: string;

  @Column({ type: DataType.STRING, allowNull: false })
  ownerFirstName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  ownerLastName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  ownerPhone: string;

  @Column({ type: DataType.STRING, allowNull: false })
  ownerSSN: string;

  @Column({ type: DataType.BOOLEAN, allowNull: true })
  privacyConsent: boolean;

  @Column({ type: DataType.INTEGER, allowNull: false })
  requestedAmount: number;

  @Column({ type: DataType.STRING, allowNull: true })
  softPullConsent: string;

  @Column({ type: DataType.STRING, allowNull: false })
  timeInBusiness: string;

  @Column({ type: DataType.STRING, allowNull: true })
  pdfUrl: string;
}
