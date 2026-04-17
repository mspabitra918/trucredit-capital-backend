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
var DocumentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const document_entity_1 = require("./entities/document.entity");
const s3_service_1 = require("../s3/s3.service");
let DocumentService = DocumentService_1 = class DocumentService {
    constructor(docModel, s3Service) {
        this.docModel = docModel;
        this.s3Service = s3Service;
        this.logger = new common_1.Logger(DocumentService_1.name);
    }
    async upload(file, applicationId, docType = 'bank_statement', label) {
        if (file.mimetype !== 'application/pdf') {
            throw new common_1.BadRequestException('Only PDF files are accepted');
        }
        if (file.size > 10 * 1024 * 1024) {
            throw new common_1.BadRequestException('File size must be under 10 MB');
        }
        try {
            const { s3Key } = await this.s3Service.uploadFile(file, applicationId);
            const doc = await this.docModel.create({
                applicationId,
                s3Key,
                originalFilename: file.originalname,
                mimeType: file.mimetype,
                fileSize: file.size,
                docType,
                label: label || null,
            });
            return doc;
        }
        catch (err) {
            this.logger.error('DocumentService.upload failed', err);
            throw new common_1.InternalServerErrorException('File upload failed');
        }
    }
    async findByApplication(applicationId) {
        return this.docModel.findAll({
            where: { applicationId },
            order: [['createdAt', 'ASC']],
        });
    }
    async getPresignedUrl(docId) {
        const doc = await this.docModel.findByPk(docId);
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        return this.s3Service.getPresignedUrl(doc.s3Key);
    }
    async delete(docId) {
        const doc = await this.docModel.findByPk(docId);
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        await this.s3Service.deleteFile(doc.s3Key);
        await doc.destroy();
    }
    async deleteByApplication(applicationId) {
        const docs = await this.docModel.findAll({ where: { applicationId } });
        if (docs.length === 0)
            return 0;
        await Promise.all(docs.map(async (doc) => {
            await this.s3Service.deleteFile(doc.s3Key);
            await doc.destroy();
        }));
        this.logger.log(`Deleted ${docs.length} documents for application ${applicationId}`);
        return docs.length;
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = DocumentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(document_entity_1.Document)),
    __metadata("design:paramtypes", [Object, s3_service_1.S3Service])
], DocumentService);
//# sourceMappingURL=document.service.js.map