import { ApiProperty } from '@nestjs/swagger';

import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { OTP_TYPE } from 'src/constants/otp.constant';

export class ResendForgotPasswordOtpDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  otp: string;
}
