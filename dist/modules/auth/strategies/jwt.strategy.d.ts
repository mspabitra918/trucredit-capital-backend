import { ConfigService } from "@nestjs/config";
import { Strategy } from "passport-jwt";
export interface JwtPayload {
    sub: string;
    email: string;
    role: "user" | "admin";
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    constructor(config: ConfigService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        email: string;
        role: "user" | "admin";
    }>;
}
export {};
