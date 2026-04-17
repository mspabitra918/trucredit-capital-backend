"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BorrowerModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const borrower_entity_1 = require("./entities/borrower.entity");
const borrower_service_1 = require("./borrower.service");
const borrower_controller_1 = require("./borrower.controller");
const email_service_1 = require("../email/email.service");
const s3_service_1 = require("../s3/s3.service");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
let BorrowerModule = class BorrowerModule {
};
exports.BorrowerModule = BorrowerModule;
exports.BorrowerModule = BorrowerModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([borrower_entity_1.Borrower]), cloudinary_module_1.CloudinaryModule],
        controllers: [borrower_controller_1.BorrowerController],
        providers: [borrower_service_1.BorrowerService, common_1.Logger, s3_service_1.S3Service, email_service_1.EmailService],
        exports: [borrower_service_1.BorrowerService, sequelize_1.SequelizeModule],
    })
], BorrowerModule);
//# sourceMappingURL=borrower.module.js.map