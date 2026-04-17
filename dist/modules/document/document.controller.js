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
exports.DocumentController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const document_service_1 = require("./document.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let DocumentController = class DocumentController {
    constructor(documentService) {
        this.documentService = documentService;
    }
    async uploadOne(applicationId, file, docType, label) {
        const doc = await this.documentService.upload(file, applicationId, docType || 'bank_statement', label);
        return { message: 'Document uploaded successfully', data: doc };
    }
    async uploadMultiple(applicationId, files, docType) {
        const docs = await Promise.all(files.map((file, i) => this.documentService.upload(file, applicationId, docType || 'bank_statement', `Document ${i + 1}`)));
        return { message: `${docs.length} documents uploaded`, data: docs };
    }
    async listByApplication(applicationId) {
        const docs = await this.documentService.findByApplication(applicationId);
        return { message: 'Documents list', data: docs };
    }
    async getViewUrl(id) {
        const url = await this.documentService.getPresignedUrl(id);
        return { message: 'Presigned URL generated (expires in 10 min)', data: { url } };
    }
    async remove(id) {
        await this.documentService.delete(id);
        return { message: 'Document deleted' };
    }
    async removeByApplication(applicationId) {
        const count = await this.documentService.deleteByApplication(applicationId);
        return { message: `${count} document(s) removed`, data: { count } };
    }
};
exports.DocumentController = DocumentController;
__decorate([
    (0, common_1.Post)('upload/:applicationId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('applicationId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Query)('docType')),
    __param(3, (0, common_1.Query)('label')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "uploadOne", null);
__decorate([
    (0, common_1.Post)('upload-multiple/:applicationId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 10)),
    __param(0, (0, common_1.Param)('applicationId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Query)('docType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "uploadMultiple", null);
__decorate([
    (0, common_1.Get)('application/:applicationId'),
    __param(0, (0, common_1.Param)('applicationId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "listByApplication", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Get)(':id/view'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getViewUrl", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "remove", null);
__decorate([
    (0, common_1.Delete)('application/:applicationId'),
    __param(0, (0, common_1.Param)('applicationId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "removeByApplication", null);
exports.DocumentController = DocumentController = __decorate([
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [document_service_1.DocumentService])
], DocumentController);
//# sourceMappingURL=document.controller.js.map