import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OtpService } from './otp.service';
import { AuthService } from './auth.service';
import { Otp } from 'src/entities/otp.entity';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { EmailService } from '../email/email.service';
import { CONFIG } from 'src/constants/config.constant';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Otp], 'company_database'),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return { secret: configService.get<string>(CONFIG.JWT_SECRET) };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, OtpService, EmailService],
  exports: [AuthService],
})
export class AuthModule {}
