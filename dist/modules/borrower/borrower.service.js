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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BorrowerService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const borrower_entity_1 = require("./entities/borrower.entity");
const s3_service_1 = require("../s3/s3.service");
const email_service_1 = require("../email/email.service");
const encryption_util_1 = require("../../common/utils/encryption.util");
const operators_1 = require("sequelize/lib/operators");
let BorrowerService = class BorrowerService {
    constructor(borrowerModel, emailService, logger, s3Service) {
        this.borrowerModel = borrowerModel;
        this.emailService = emailService;
        this.logger = logger;
        this.s3Service = s3Service;
    }
    async create(data) {
        const { annualRevenue, businessAddress, businessCity, businessName, businessState, businessZip, ein, industry, ownerDOB, ownerEmail, ownerFirstName, ownerLastName, ownerPhone, ownerSSN, privacyConsent, requestedAmount, softPullConsent, timeInBusiness, pdfUrl, } = data;
        const einEncrypted = ein ? (0, encryption_util_1.encrypt)(ein) : null;
        const ssnEncrypted = ownerSSN ? (0, encryption_util_1.encrypt)(ownerSSN) : null;
        const borrower = await this.borrowerModel.create({
            annualRevenue,
            businessAddress,
            businessCity,
            businessName,
            businessState,
            businessZip,
            ein: einEncrypted,
            industry,
            ownerDOB,
            ownerEmail,
            ownerFirstName,
            ownerLastName,
            ownerPhone,
            ownerSSN: ssnEncrypted,
            privacyConsent,
            requestedAmount,
            softPullConsent,
            timeInBusiness,
            pdfUrl,
        });
        await this.emailService
            .sendApplicationConfirmation(data.ownerEmail, `${data.ownerFirstName} ${data.ownerLastName}`, String(borrower.id), data.requestedAmount)
            .catch((err) => this.logger.error("Confirmation email failed", err));
        await this.emailService
            .sendHotLeadAlert(data.businessName, `${data.ownerFirstName} ${data.ownerLastName}`, data.requestedAmount, data.annualRevenue, data.industry, data.ownerPhone, data.ownerEmail)
            .catch((err) => this.logger.error("Hot lead alert email failed", err));
        return borrower;
    }
    async findAll(query) {
        try {
            const page = query.page ?? 1;
            const limit = query.limit ?? 10;
            const offset = (page - 1) * limit;
            const where = {};
            if (query.search) {
                where[operators_1.Op.or] = [
                    { ownerName: { [operators_1.Op.iLike]: `%${query.search}%` } },
                    { email: { [operators_1.Op.iLike]: `%${query.search}%` } },
                    { businessName: { [operators_1.Op.iLike]: `%${query.search}%` } },
                ];
            }
            const { rows, count } = await this.borrowerModel.findAndCountAll({
                where,
                limit,
                offset,
                order: [["createdAt", "DESC"]],
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
            this.logger.error("BorrowerService.findAll failed", err);
            throw new common_1.InternalServerErrorException("Failed to fetch borrowers");
        }
    }
    async findOne(id) {
        try {
            const application = await this.borrowerModel.findByPk(id, {});
            if (!application)
                throw new common_1.NotFoundException("Application not found");
            return application;
        }
        catch (err) {
            if (err instanceof common_1.NotFoundException)
                throw err;
            this.logger.error("BorrowerService.findOne failed", err);
            throw new common_1.InternalServerErrorException("Lookup failed");
        }
    }
    async findById(id) {
        const borrower = await this.borrowerModel.findByPk(id);
        if (!borrower) {
            throw new common_1.NotFoundException(`Borrower #${id} not found`);
        }
        return borrower;
    }
    async uploadPdf(file) {
        const { s3Key } = await this.s3Service.uploadFile(file);
        const pdfUrl = `https://${process.env.AWS_S3_BUCKET || "trucredit-documents"}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${s3Key}`;
        return { pdfUrl };
    }
    async getPdfPresignedUrl(id) {
        const borrower = await this.findById(id);
        if (!borrower.pdfUrl) {
            throw new common_1.NotFoundException(`No PDF uploaded for borrower #${id}`);
        }
        const url = new URL(borrower.pdfUrl);
        const s3Key = url.pathname.substring(1);
        return this.s3Service.getPresignedUrl(s3Key);
    }
};
exports.BorrowerService = BorrowerService;
exports.BorrowerService = BorrowerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(borrower_entity_1.Borrower)),
    __metadata("design:paramtypes", [Object, email_service_1.EmailService,
        common_1.Logger,
        s3_service_1.S3Service])
], BorrowerService);
//# sourceMappingURL=borrower.service.js.map