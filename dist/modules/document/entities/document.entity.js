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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const loan_application_entity_1 = require("../../loan/entities/loan-application.entity");
let Document = class Document extends sequelize_typescript_1.Model {
};
exports.Document = Document;
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.UUID,
        defaultValue: sequelize_typescript_1.DataType.UUIDV4,
        primaryKey: true,
    }),
    __metadata("design:type", String)
], Document.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => loan_application_entity_1.LoanApplication),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, allowNull: false }),
    __metadata("design:type", String)
], Document.prototype, "applicationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => loan_application_entity_1.LoanApplication),
    __metadata("design:type", loan_application_entity_1.LoanApplication)
], Document.prototype, "application", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: false }),
    __metadata("design:type", String)
], Document.prototype, "s3Key", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], Document.prototype, "originalFilename", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false, defaultValue: 'application/pdf' }),
    __metadata("design:type", String)
], Document.prototype, "mimeType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Number)
], Document.prototype, "fileSize", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('bank_statement', 'tax_return', 'profit_loss', 'balance_sheet', 'asset_appraisal', 'id_document', 'other'),
        defaultValue: 'bank_statement',
    }),
    __metadata("design:type", String)
], Document.prototype, "docType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], Document.prototype, "label", void 0);
exports.Document = Document = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'documents', timestamps: true })
], Document);
//# sourceMappingURL=document.entity.js.map