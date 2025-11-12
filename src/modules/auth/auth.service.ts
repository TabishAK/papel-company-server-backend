import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Http } from 'src/utils/http.util';
import { LogInDto } from './dto/signin.dto';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { createHashPassword, verifyPassword, verifyToken } from 'src/utils/auth.util';
import { getTenantEndpoint } from 'src/utils/endpoint';
import { CONFIG } from 'src/constants/config.constant';
import { HttpStatus, Injectable } from '@nestjs/common';
import { TOKEN_TYPES, TOKEN_VALIDITY } from 'src/constants/auth.constant';
import { SerializeHttpResponse } from 'src/utils/serializer.util';
import { getCompanySecretKeyHeader } from 'src/utils/company.util';
import { Employee } from 'src/types/employee.type';
import { ChangePasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { OtpService } from './otp.service';
import { OTP_TYPE } from 'src/constants/otp.constant';
import { EmailService } from '../email/email.service';
import { EMAIL_SUBJECT } from 'src/constants/responses/email.response';
import { VerifyOtpDto } from './dto/otp.dto';

@Injectable()
export class AuthService {
  private readonly tenantDomain: string;

  constructor(
    @InjectRepository(User, 'company_database')
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
  ) {}

  generateToken(id: string, expiresIn: string, tokenType: TOKEN_TYPES, tokenPayload = {}) {
    const payload = { sub: id, tokenType, ...tokenPayload };
    const secret = this.configService.get<string>(CONFIG.JWT_SECRET);
    return this.jwtService.sign(payload, { secret, expiresIn });
  }

  async login({ email, password }: LogInDto) {
    const user = await this.userRepository.findOne({ where: { email } });

    console.log('user already exists in the database', user);

    if (!user) {
      const baseUrl = getTenantEndpoint();
      const endpoint = `${baseUrl}/employees/verify-with-temporary-login`;

      try {
        const response = await Http.post<Employee>(
          endpoint,
          { email, password },
          { headers: { ...getCompanySecretKeyHeader() } },
        );

        if (!response.data) {
          return SerializeHttpResponse(false, HttpStatus.UNAUTHORIZED, 'Invalid email or password');
        }

        const user = await this.userRepository.save({
          id: response.data.id,
          fullName: response.data.fullName,
          email: response.data.email,
          address: response.data.address,
          contactNumber: response.data.contactNumber,
          isActive: response.data.isActive,
          companyId: response.data.companyId,
          departmentId: response.data.departmentId,
          sectionId: response.data.sectionId,
          temporaryPassword: response.data.temporaryPassword,
          securityLevel: response.data.securityLevel,
        });

        const resetPasswordToken = this.generateToken(
          user.id,
          TOKEN_VALIDITY.RESET_PASSWORD,
          TOKEN_TYPES.RESET_PASSWORD,
        );

        return SerializeHttpResponse(
          { resetPasswordToken, email: user.email, isPasswordResetDone: false },
          HttpStatus.OK,
          'User created successfully',
        );
      } catch (err) {
        return SerializeHttpResponse(false, HttpStatus.UNAUTHORIZED, err.response);
      }
    }

    if (!user.isPasswordResetDone) {
      const resetPasswordToken = this.generateToken(
        user.id,
        TOKEN_VALIDITY.RESET_PASSWORD,
        TOKEN_TYPES.RESET_PASSWORD,
      );

      return SerializeHttpResponse(
        { resetPasswordToken, email: user.email, isPasswordResetDone: false },
        HttpStatus.OK,
        'Reset Password token sent!',
      );
    }

    const isPasswordValid = await verifyPassword(password, user?.password ?? '');

    if (!isPasswordValid) {
      return SerializeHttpResponse(false, HttpStatus.UNAUTHORIZED, 'Invalid email or password');
    }

    const token = this.generateToken(user.id, TOKEN_VALIDITY.LOGIN, TOKEN_TYPES.LOGIN);
    const payload = { token, id: user.id, email: user.email, isPasswordResetDone: true };
    return SerializeHttpResponse(payload, HttpStatus.OK, 'Login successful');
  }

  async resetPassword({ token, password }: ResetPasswordDto) {
    const tokenPayload = await verifyToken(token);

    if (!tokenPayload || tokenPayload.tokenType !== TOKEN_TYPES.RESET_PASSWORD) {
      return SerializeHttpResponse(false, HttpStatus.UNAUTHORIZED, 'Invalid token');
    }

    const user = await this.userRepository.findOne({ where: { id: tokenPayload.id } });

    if (!user) {
      return SerializeHttpResponse(false, HttpStatus.UNAUTHORIZED, 'User not found');
    }

    const hashedPassword = await createHashPassword(password);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      isPasswordResetDone: true,
    });

    const newToken = this.generateToken(user.id, TOKEN_VALIDITY.LOGIN, TOKEN_TYPES.LOGIN);
    const payload = { token: newToken, id: user.id, email: user.email, isPasswordResetDone: true };
    return SerializeHttpResponse(payload, HttpStatus.OK, 'Password reset successfully');
  }

  async changePassword(id: string, { oldPassword, newPassword }: ChangePasswordDto) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return SerializeHttpResponse(false, HttpStatus.UNAUTHORIZED, 'User not found');
    }

    const isPasswordValid = await verifyPassword(oldPassword, user?.password ?? '');
    if (!isPasswordValid) {
      return SerializeHttpResponse(false, HttpStatus.UNAUTHORIZED, 'Invalid old password');
    }

    const hashedPassword = await createHashPassword(newPassword);
    await this.userRepository.update(user.id, { password: hashedPassword });
    return SerializeHttpResponse(true, HttpStatus.OK, 'Password changed successfully');
  }

  async me(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      return SerializeHttpResponse(false, HttpStatus.UNAUTHORIZED, 'User not found');
    }
    return SerializeHttpResponse(user, HttpStatus.OK, 'User details fetched successfully');
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return SerializeHttpResponse(false, HttpStatus.UNAUTHORIZED, 'User not found');
    }

    const otp = await this.otpService.generateOTP(email, OTP_TYPE.FORGOT_PASSWORD_OTP);
    const bodyHtml = await this.emailService.loadTemplate('otp', { otp: otp.otp });
    await this.emailService.sendEmail(email, EMAIL_SUBJECT.FORGOT_PASSWORD_OTP, bodyHtml);

    return SerializeHttpResponse(true, HttpStatus.OK, 'OTP sent successfully');
  }

  async verifyForgotPasswordOtp(verifyForgotPasswordDto: VerifyOtpDto) {
    const { email, otp } = verifyForgotPasswordDto;
    const verifiedOtp = await this.otpService.verifyOTP(
      email,
      parseInt(otp),
      OTP_TYPE.FORGOT_PASSWORD_OTP,
    );

    if (!verifiedOtp.verified) {
      return SerializeHttpResponse(false, HttpStatus.UNAUTHORIZED, 'Invalid OTP');
    }

    const token = this.generateToken(
      verifiedOtp.otpId,
      TOKEN_VALIDITY.RESET_PASSWORD,
      TOKEN_TYPES.RESET_PASSWORD,
    );

    return SerializeHttpResponse(token, HttpStatus.OK, 'OTP verified successfully');
  }

  async getCompanyInfo() {
    let response;
    try {
      const url = getTenantEndpoint() + '/company/info';
      console.log('url', url);
      response = await Http.get(getTenantEndpoint() + '/company/info', {
        headers: { ...getCompanySecretKeyHeader() },
      });
    } catch (error) {
      console.log('error', error);
      return SerializeHttpResponse(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }

    console.log('company info', response.data);

    return SerializeHttpResponse(response.data, HttpStatus.OK, 'Company info fetched successfully');
  }
}
