import { Model } from 'sequelize-typescript';
import { LoanApplication } from '../../loan/entities/loan-application.entity';
export declare class User extends Model<User> {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: 'user' | 'admin';
    applications: LoanApplication[];
}
