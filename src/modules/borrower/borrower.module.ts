import { Logger, Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Borrower } from "./entities/borrower.entity";
import { BorrowerService } from "./borrower.service";
import { BorrowerController } from "./borrower.controller";
import { EmailService } from "../email/email.service";
import { S3Service } from "../s3/s3.service";
import { CloudinaryModule } from "../cloudinary/cloudinary.module";

@Module({
  imports: [SequelizeModule.forFeature([Borrower]), CloudinaryModule],
  controllers: [BorrowerController],
  providers: [BorrowerService, Logger, S3Service, EmailService],
  exports: [BorrowerService, SequelizeModule],
})
export class BorrowerModule {}
