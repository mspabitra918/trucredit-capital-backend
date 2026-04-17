import { Model } from "sequelize-typescript";
export declare class Admin extends Model<Admin> {
    id: string;
    fullName: string;
    email: string;
    password: string;
    role: "admin" | "user";
}
