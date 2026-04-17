"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sequelize_1 = require("@nestjs/sequelize");
const auth_module_1 = require("./modules/auth/auth.module");
const loan_module_1 = require("./modules/loan/loan.module");
const admin_module_1 = require("./modules/admin/admin.module");
const user_module_1 = require("./modules/user/user.module");
const document_module_1 = require("./modules/document/document.module");
const s3_module_1 = require("./modules/s3/s3.module");
const email_module_1 = require("./modules/email/email.module");
const borrower_module_1 = require("./modules/borrower/borrower.module");
const user_entity_1 = require("./modules/user/entities/user.entity");
const loan_application_entity_1 = require("./modules/loan/entities/loan-application.entity");
const admin_entity_1 = require("./modules/admin/entities/admin.entity");
const document_entity_1 = require("./modules/document/entities/document.entity");
const borrower_entity_1 = require("./modules/borrower/entities/borrower.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            sequelize_1.SequelizeModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    dialect: 'postgres',
                    host: config.get('DB_HOST', 'localhost'),
                    port: config.get('DB_PORT', 5432),
                    username: config.get('DB_USERNAME', 'postgres'),
                    password: config.get('DB_PASSWORD', 'postgres'),
                    database: config.get('DB_NAME', 'business_loan'),
                    models: [user_entity_1.User, loan_application_entity_1.LoanApplication, admin_entity_1.Admin, document_entity_1.Document, borrower_entity_1.Borrower],
                    autoLoadModels: true,
                    synchronize: true,
                    logging: false,
                }),
            }),
            s3_module_1.S3Module,
            email_module_1.EmailModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            loan_module_1.LoanModule,
            document_module_1.DocumentModule,
            admin_module_1.AdminModule,
            borrower_module_1.BorrowerModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map