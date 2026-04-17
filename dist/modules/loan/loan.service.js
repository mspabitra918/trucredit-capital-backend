"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var LoanService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoanService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const loan_application_entity_1 = require("./entities/loan-application.entity");
const document_entity_1 = require("../document/entities/document.entity");
const encryption_util_1 = require("../../common/utils/encryption.util");
const email_service_1 = require("../email/email.service");
let LoanService = LoanService_1 = class LoanService {
    constructor(loanModel, documentModel, emailService) {
        this.loanModel = loanModel;
        this.documentModel = documentModel;
        this.emailService = emailService;
        this.logger = new common_1.Logger(LoanService_1.name);
    }
    async create(dto, userId) {
        try {
            const einEncrypted = dto.ein ? (0, encryption_util_1.encrypt)(dto.ein) : null;
            const ssnEncrypted = dto.ownerSSN ? (0, encryption_util_1.encrypt)(dto.ownerSSN) : null;
            const tier = dto.requestedAmount >= 500000 ? "high_limit" : "express";
            const application = await this.loanModel.create({
                userId: userId ?? null,
                requestedAmount: dto.requestedAmount,
                annualRevenue: dto.annualRevenue,
                timeInBusiness: dto.timeInBusiness,
                businessName: dto.businessName,
                einEncrypted,
                industry: dto.industry,
                businessAddress: dto.businessAddress || null,
                businessCity: dto.businessCity || null,
                businessState: dto.businessState || null,
                businessZip: dto.businessZip || null,
                ownerName: `${dto.ownerFirstName} ${dto.ownerLastName}`.trim(),
                ssnEncrypted,
                phone: dto.ownerPhone,
                email: dto.ownerEmail,
                dateOfBirth: dto.ownerDOB || null,
                status: "NEW_LEAD",
                tier,
                pdfUrl: dto.pdfUrl ?? null,
            });
            this.emailService
                .sendApplicationConfirmation(dto.ownerEmail, `${dto.ownerFirstName} ${dto.ownerLastName}`, application.id, dto.requestedAmount)
                .catch((err) => this.logger.error("Confirmation email failed", err));
            this.emailService
                .sendHotLeadAlert(dto.businessName, `${dto.ownerFirstName} ${dto.ownerLastName}`, dto.requestedAmount, dto.annualRevenue, dto.industry, dto.ownerPhone, dto.ownerEmail)
                .catch((err) => this.logger.error("Hot lead alert email failed", err));
            return application;
        }
        catch (err) {
            this.logger.error("LoanService.create failed", err);
            throw new common_1.InternalServerErrorException("Could not submit loan application");
        }
    }
    async findAll(query) {
        try {
            const page = query.page ?? 1;
            const limit = query.limit ?? 10;
            const offset = (page - 1) * limit;
            const where = {};
            if (query.search) {
                where[sequelize_2.Op.or] = [
                    { ownerName: { [sequelize_2.Op.iLike]: `%${query.search}%` } },
                    { email: { [sequelize_2.Op.iLike]: `%${query.search}%` } },
                    { businessName: { [sequelize_2.Op.iLike]: `%${query.search}%` } },
                ];
            }
            if (query.date) {
                where.createdAt = {
                    [sequelize_2.Op.gte]: new Date(query.date),
                    [sequelize_2.Op.lt]: new Date(new Date(query.date).getTime() + 86400000),
                };
            }
            const { rows, count } = await this.loanModel.findAndCountAll({
                where,
                limit,
                offset,
                order: [["createdAt", "DESC"]],
                include: [{ model: document_entity_1.Document, as: "documents" }],
            });
            return {
                items: rows,
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            };
        }
        catch (err) {
            this.logger.error("LoanService.findAll failed", err);
            throw new common_1.InternalServerErrorException("Failed to fetch applications");
        }
    }
    async findOne(id) {
        try {
            const application = await this.loanModel.findByPk(id, {
                include: [{ model: document_entity_1.Document, as: "documents" }],
            });
            if (!application)
                throw new common_1.NotFoundException("Application not found");
            return application;
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException)
                throw err;
            this.logger.error("LoanService.findOne failed", err);
            throw new common_1.InternalServerErrorException("Lookup failed");
        }
    }
    async findMine(userId) {
        try {
            return await this.loanModel.findAll({
                where: { userId },
                order: [["createdAt", "DESC"]],
                include: [{ model: document_entity_1.Document, as: "documents" }],
            });
        }
        catch (err) {
            this.logger.error("LoanService.findMine failed", err);
            throw new common_1.InternalServerErrorException("Lookup failed");
        }
    }
    async updateStatus(id, dto) {
        try {
            const application = await this.findOne(id);
            application.status = dto.status;
            if (dto.adminNote !== undefined)
                application.adminNote = dto.adminNote;
            await application.save();
            this.emailService
                .sendStatusUpdate(application.email, application.ownerName, dto.status, dto.adminNote)
                .catch((err) => this.logger.error("Status update email failed", err));
            return application;
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException)
                throw err;
            this.logger.error("LoanService.updateStatus failed", err);
            throw new common_1.InternalServerErrorException("Could not update status");
        }
    }
    async stats() {
        try {
            const [total, newLead, underReview, stipsNeeded, offerSent, declined, funded,] = await Promise.all([
                this.loanModel.count(),
                this.loanModel.count({ where: { status: "NEW_LEAD" } }),
                this.loanModel.count({ where: { status: "UNDER_REVIEW" } }),
                this.loanModel.count({ where: { status: "STIPS_NEEDED" } }),
                this.loanModel.count({ where: { status: "OFFER_SENT" } }),
                this.loanModel.count({ where: { status: "DECLINED" } }),
                this.loanModel.count({ where: { status: "FUNDED" } }),
            ]);
            return {
                total,
                newLead,
                underReview,
                stipsNeeded,
                offerSent,
                declined,
                funded,
            };
        }
        catch (err) {
            this.logger.error("LoanService.stats failed", err);
            throw new common_1.InternalServerErrorException("Could not load stats");
        }
    }
};
exports.LoanService = LoanService;
exports.LoanService = LoanService = LoanService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(loan_application_entity_1.LoanApplication)),
    __param(1, (0, sequelize_1.InjectModel)(document_entity_1.Document)),
    __metadata("design:paramtypes", [Object, Object, email_service_1.EmailService])
], LoanService);
//# sourceMappingURL=loan.service.js.map