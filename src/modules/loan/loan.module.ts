import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { LoanApplication } from "./entities/loan-application.entity";
import { LoanService } from "./loan.service";
import { LoanController } from "./loan.controller";
import { DocumentModule } from "../document/document.module";
import { Document } from "../document/entities/document.entity";

@Module({
  imports: [SequelizeModule.forFeature([LoanApplication]), DocumentModule],
  controllers: [LoanController],
  providers: [LoanService],
  exports: [LoanService, SequelizeModule],
})
export class LoanModule {}
