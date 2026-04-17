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
exports.GenerateOfferDto = void 0;
const class_validator_1 = require("class-validator");
class GenerateOfferDto {
}
exports.GenerateOfferDto = GenerateOfferDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(5000),
    __metadata("design:type", Number)
], GenerateOfferDto.prototype, "offeredAmount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GenerateOfferDto.prototype, "factorRate", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['daily', 'weekly', 'bi-weekly', 'monthly']),
    __metadata("design:type", String)
], GenerateOfferDto.prototype, "paymentFrequency", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], GenerateOfferDto.prototype, "termMonths", void 0);
//# sourceMappingURL=generate-offer.dto.js.map