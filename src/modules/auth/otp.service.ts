import { Repository } from 'typeorm';
import { Otp } from 'src/entities/otp.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DB_NAME } from 'src/constants/db.constant';
import { OTP_ERROR } from 'src/constants/responses/otp.response';
import { OTP_STATUS, OTP_TYPE } from 'src/constants/otp.constant';
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp, DB_NAME)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  async generateOTP(email: string, type: OTP_TYPE) {
    try {
      await this.otpRepository.update(
        { email, type, status: OTP_STATUS.PENDING },
        { status: OTP_STATUS.EXPIRED },
      );

      const otp = Math.floor(100000 + Math.random() * 900000);

      const newOtp = this.otpRepository.create({
        email,
        otp: otp.toString(),
        type,
        status: OTP_STATUS.PENDING,
      });

      await this.otpRepository.save(newOtp);
      return newOtp;
    } catch (error) {
      throw new BadRequestException(OTP_ERROR.OTP_GENERATION);
    }
  }

  async verifyOTP(
    email: string,
    otp: number,
    type: OTP_TYPE,
  ): Promise<{ verified: boolean; otpId: string }> {
    const otpRecord = await this.otpRepository.findOne({
      where: {
        email,
        otp: otp.toString(),
        type,
        status: OTP_STATUS.PENDING,
      },
    });

    if (!otpRecord) {
      throw new NotFoundException(OTP_ERROR.VERIFICATION_FAILED);
    }

    // Check if OTP is expired (using createdAt + 10 minutes)
    const now = new Date();
    const expirationTime = new Date(otpRecord.createdAt.getTime() + 10 * 60 * 1000);

    if (now > expirationTime) {
      await this.otpRepository.update({ id: otpRecord.id }, { status: OTP_STATUS.EXPIRED });

      throw new BadRequestException(OTP_ERROR.OTP_EXPIRED);
    }

    await this.otpRepository.update({ id: otpRecord.id }, { status: OTP_STATUS.VERIFIED });

    return { verified: true, otpId: otpRecord.id };
  }
}
