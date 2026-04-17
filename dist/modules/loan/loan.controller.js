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
exports.LoanController = void 0;
const common_1 = require("@nestjs/common");
const loan_service_1 = require("./loan.service");
const create_loan_dto_1 = require("./dto/create-loan.dto");
let LoanController = class LoanController {
    constructor(loanService) {
        this.loanService = loanService;
    }
    async apply(dto, req) {
        const userId = req.user?.id;
        const application = await this.loanService.create(dto, userId);
        return {
            message: "Loan application submitted successfully",
            data: {
                id: application.id,
                status: application.status,
                tier: application.tier,
            },
        };
    }
};
exports.LoanController = LoanController;
__decorate([
    (0, common_1.Post)("apply"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_loan_dto_1.CreateLoanDto, Object]),
    __metadata("design:returntype", Promise)
], LoanController.prototype, "apply", null);
exports.LoanController = LoanController = __decorate([
    (0, common_1.Controller)("loans"),
    __metadata("design:paramtypes", [loan_service_1.LoanService])
], LoanController);
//# sourceMappingURL=loan.controller.js.map