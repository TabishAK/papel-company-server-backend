import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { CONFIG } from './constants/config.constant';
import { getDatabaseConfig } from './config/db_config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MediaModule } from './modules/media/media.module';
import { CompanyModule } from './modules/company/company.module';
import { PasswordPolicyModule } from './modules/password-policy/password-policy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: `.env.${process.env[CONFIG.NODE_ENV]}`,
    }),
    MediaModule,
    AuthModule,
    UserModule,
    PasswordPolicyModule,
    CompanyModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(getDatabaseConfig()),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
