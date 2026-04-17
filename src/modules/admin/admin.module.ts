import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

import { Admin } from "./entities/admin.entity";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { LoanModule } from "../loan/loan.module";
import { BorrowerModule } from "../borrower/borrower.module";

@Module({
  imports: [
    SequelizeModule.forFeature([Admin]),
    LoanModule,
    BorrowerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET", "change_this_super_secret"),
        signOptions: {
          expiresIn: config.get<string>("JWT_EXPIRES_IN", "1d"),
        },
      }),
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
