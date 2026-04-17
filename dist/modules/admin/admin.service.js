"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const admin_entity_1 = require("./entities/admin.entity");
const loan_service_1 = require("../loan/loan.service");
const email_service_1 = require("../email/email.service");
const borrower_service_1 = require("../borrower/borrower.service");
const encryption_util_1 = require("../../common/utils/encryption.util");
let AdminService = AdminService_1 = class AdminService {
    constructor(adminModel, jwtService, loanService, emailService, borrowerService) {
        this.adminModel = adminModel;
        this.jwtService = jwtService;
        this.loanService = loanService;
        this.emailService = emailService;
        this.borrowerService = borrowerService;
        this.logger = new common_1.Logger(AdminService_1.name);
    }
    async onModuleInit() {
        try {
            const count = await this.adminModel.count();
            if (count === 0) {
                const password = await bcrypt.hash("Admin@123", 10);
                await this.adminModel.create({
                    fullName: "Super Admin",
                    email: "admin@businessloan.com",
                    password,
                });
                this.logger.log("Default admin created -> admin@businessloan.com / Admin@123");
            }
        }
        catch (err) {
            this.logger.error("Failed to seed default admin", err);
        }
    }
    async login(email, password) {
        try {
            const admin = await this.adminModel.findOne({ where: { email } });
            if (!admin)
                throw new common_1.UnauthorizedException("Invalid credentials");
            const valid = await bcrypt.compare(password, admin.password);
            if (!valid)
                throw new common_1.UnauthorizedException("Invalid credentials");
            const token = this.jwtService.sign({
                sub: admin.id,
                email: admin.email,
                role: "admin",
            });
            return {
                message: "Admin login successful",
                data: {
                    token,
                    admin: {
                        id: admin.id,
                        fullName: admin.fullName,
                        email: admin.email,
                    },
                },
            };
        }
        catch (err) {
            if (err instanceof common_1.UnauthorizedException)
                throw err;
            this.logger.error("AdminService.login failed", err);
            throw new common_1.InternalServerErrorException("Login failed");
        }
    }
    async listApplications(query) {
        return this.loanService.findAll(query);
    }
    async getApplication(id) {
        const application = await this.loanService.findOne(id);
        const plain = application.toJSON();
        try {
            plain.ein = plain.einEncrypted ? (0, encryption_util_1.decrypt)(plain.einEncrypted) : null;
        }
        catch {
            plain.ein = null;
        }
        try {
            plain.ssn = plain.ssnEncrypted ? (0, encryption_util_1.decrypt)(plain.ssnEncrypted) : null;
        }
        catch {
            plain.ssn = null;
        }
        return plain;
    }
    async updateApplicationStatus(id, dto) {
        return this.loanService.updateStatus(id, dto);
    }
    async dashboardStats() {
        return this.loanService.stats();
    }
    async sendStipulation(applicationId, dto) {
        const application = await this.loanService.findOne(applicationId);
        application.status = "STIPS_NEEDED";
        application.adminNote = `Documents requested: ${dto.missingItems.join(", ")}`;
        await application.save();
        await this.emailService.sendStipulationRequest(application.email, application.ownerName, dto.missingItems, applicationId);
        return application;
    }
    async generateOffer(applicationId, dto) {
        const application = await this.loanService.findOne(applicationId);
        const totalPayback = Number((dto.offeredAmount * dto.factorRate).toFixed(2));
        application.offeredAmount = dto.offeredAmount;
        application.factorRate = dto.factorRate;
        application.paymentFrequency = dto.paymentFrequency;
        application.termMonths = dto.termMonths;
        application.totalPayback = totalPayback;
        application.status = "OFFER_SENT";
        await application.save();
        const estimatedPayment = this.calculatePayment(totalPayback, dto.termMonths, dto.paymentFrequency);
        await this.emailService.sendStatusUpdate(application.email, application.ownerName, "OFFER_SENT", undefined, {
            offeredAmount: dto.offeredAmount,
            factorRate: dto.factorRate,
            paymentFrequency: dto.paymentFrequency,
            termMonths: dto.termMonths,
            totalPayback,
            estimatedPayment,
        });
        const termSheet = {
            applicationId: application.id,
            businessName: application.businessName,
            ownerName: application.ownerName,
            offeredAmount: dto.offeredAmount,
            factorRate: dto.factorRate,
            totalPayback,
            paymentFrequency: dto.paymentFrequency,
            termMonths: dto.termMonths,
            estimatedPayment,
        };
        return { application, termSheet };
    }
    calculatePayment(totalPayback, termMonths, frequency) {
        let totalPayments;
        switch (frequency) {
            case "daily":
                totalPayments = termMonths * 22;
                break;
            case "weekly":
                totalPayments = termMonths * 4.33;
                break;
            case "bi-weekly":
                totalPayments = termMonths * 2.17;
                break;
            case "monthly":
            default:
                totalPayments = termMonths;
                break;
        }
        return Number((totalPayback / totalPayments).toFixed(2));
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(admin_entity_1.Admin)),
    __metadata("design:paramtypes", [Object, jwt_1.JwtService,
        loan_service_1.LoanService,
        email_service_1.EmailService,
        borrower_service_1.BorrowerService])
], AdminService);
//# sourceMappingURL=admin.service.js.map