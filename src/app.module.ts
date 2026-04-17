import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import * as pg from 'pg';

import { AuthModule } from './modules/auth/auth.module';
import { LoanModule } from './modules/loan/loan.module';
import { AdminModule } from './modules/admin/admin.module';
import { UserModule } from './modules/user/user.module';
import { DocumentModule } from './modules/document/document.module';
import { S3Module } from './modules/s3/s3.module';
import { EmailModule } from './modules/email/email.module';
import { BorrowerModule } from './modules/borrower/borrower.module';

import { User } from './modules/user/entities/user.entity';
import { LoanApplication } from './modules/loan/entities/loan-application.entity';
import { Admin } from './modules/admin/entities/admin.entity';
import { Document } from './modules/document/entities/document.entity';
import { Borrower } from './modules/borrower/entities/borrower.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<string>('NODE_ENV') === 'production';
        const url =
          config.get<string>('DATABASE_URL') ||
          config.get<string>('POSTGRES_URL');

        const base = {
          dialect: 'postgres' as const,
          dialectModule: pg,
          dialectOptions: isProd
            ? { ssl: { require: true, rejectUnauthorized: false } }
            : {},
          pool: { max: 2, min: 0, idle: 0, acquire: 5000, evict: 1000 },
          models: [User, LoanApplication, Admin, Document, Borrower],
          autoLoadModels: true,
          synchronize: !isProd,
          logging: false,
        };

        if (url) return { ...base, uri: url };

        return {
          ...base,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 5432),
          username: config.get<string>('DB_USERNAME', 'postgres'),
          password: config.get<string>('DB_PASSWORD', 'postgres'),
          database: config.get<string>('DB_NAME', 'business_loan'),
        };
      },
    }),
    S3Module,
    EmailModule,
    AuthModule,
    UserModule,
    LoanModule,
    DocumentModule,
    AdminModule,
    BorrowerModule,
  ],
})
export class AppModule {}
