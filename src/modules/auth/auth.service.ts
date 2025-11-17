import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Http } from 'src/utils/http.util';
import { OtpService } from './otp.service';
import { LogInDto } from './dto/signin.dto';
import { VerifyOtpDto } from './dto/otp.dto';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/entities/user.entity';
import { Employee } from 'src/types/employee.type';
import { InjectRepository } from '@nestjs/typeorm';
import { DB_NAME } from 'src/constants/db.constant';
import { OTP_TYPE } from 'src/constants/otp.constant';
import { EmailService } from '../email/email.service';
import { getTenantEndpoint } from 'src/utils/endpoint';
import { CONFIG } from 'src/constants/config.constant';
import { HttpStatus, Injectable } from '@nestjs/common';
import { SerializeHttpResponse } from 'src/utils/serializer.util';
import { getCompanySecretKeyHeader } from 'src/utils/company.util';
import { EMAIL_SUBJECT } from 'src/constants/responses/email.response';
import { TOKEN_TYPES, TOKEN_VALIDITY } from 'src/constants/auth.constant';
import { ChangePasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { PasswordPolicyService } from '../password-policy/password-policy.service';
import { createHashPassword, verifyPassword, verifyToken } from 'src/utils/auth.util';
import { PasswordPolicyValidationService } from '../password-policy/password-policy-validation.service';

@Injectable()
export class AuthService {
  private readonly tenantDomain: string;

  constructor(
    @InjectRepository(User, DB_NAME)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
    private readonly emailService: EmailService,
    private readonly passwordPolicyValidationService: PasswordPolicyValidationService,
    private readonly passwordPolicyService: PasswordPolicyService,
  ) {}

  generateToken(id: string, expiresIn: string, tokenType: TOKEN_TYPES, tokenPayload = {}) {
    const payload = { sub: id, tokenType, ...tokenPayload };
    const secret = this.configService.get<string>(CONFIG.JWT_SECRET);
    return this.jwtService.sign(payload, { secret, expiresIn });
  }

  async login({ email, password }: LogInDto) {
    const user = await this.userRepository.findOne({ where: { email } });

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

    const lockoutCheck = await this.passwordPolicyValidationService.checkAccountLockout(user.id);

    if (lockoutCheck.locked) {
      return SerializeHttpResponse(
        false,
        HttpStatus.FORBIDDEN,
        lockoutCheck.message || 'Account is locked',
      );
    }

    if (user.password) {
      const isPasswordValid = await verifyPassword(password, user?.password ?? '');

      if (!isPasswordValid) {
        await this.passwordPolicyValidationService.recordFailedLoginAttempt(user.id);
        return SerializeHttpResponse(false, HttpStatus.UNAUTHORIZED, 'Invalid email or password');
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

    const passwordExpiryCheck = await this.passwordPolicyValidationService.checkMaximumPasswordAge(
      user.id,
    );

    if (passwordExpiryCheck.expired) {
      const resetPasswordToken = this.generateToken(
        user.id,
        TOKEN_VALIDITY.RESET_PASSWORD,
        TOKEN_TYPES.RESET_PASSWORD,
      );

      return SerializeHttpResponse(
        {
          resetPasswordToken,
          email: user.email,
          isPasswordResetDone: false,
          passwordExpired: true,
        },
        HttpStatus.OK,
        'Your password has expired. Please reset it.',
      );
    }

    const isPasswordValid = await verifyPassword(password, user?.password ?? '');

    if (!isPasswordValid) {
      await this.passwordPolicyValidationService.recordFailedLoginAttempt(user.id);
      return SerializeHttpResponse(false, HttpStatus.UNAUTHORIZED, 'Invalid email or password');
    }

    await this.passwordPolicyValidationService.resetFailedLoginAttempts(user.id);

    const passwordWarning = await this.passwordPolicyValidationService.checkPasswordExpiryWarning(
      user.id,
    );

    const token = this.generateToken(user.id, TOKEN_VALIDITY.LOGIN, TOKEN_TYPES.LOGIN);
    const payload = {
      token,
      id: user.id,
      email: user.email,
      isPasswordResetDone: true,
      passwordWarning: passwordWarning.warning
        ? { warning: true, daysUntilExpiry: passwordWarning.daysUntilExpiry }
        : null,
    };

    return SerializeHttpResponse(payload, HttpStatus.OK, 'Login successful');
  }

  async resetPassword({ token, password }: ResetPasswordDto) {
    const tokenPayload = await verifyToken(token);

    if (!tokenPayload || tokenPayload.tokenType !== TOKEN_TYPES.RESET_PASSWORD) {
      return SerializeHttpResponse(false, HttpStatus.UNAUTHORIZED, 'Invalid token');
    }

    const user = await this.userRepository.findOne({ where: { id: tokenPayload.sub } });

    if (!user) {
      return SerializeHttpResponse(false, HttpStatus.UNAUTHORIZED, 'User not found');
    }

    const policy = await this.passwordPolicyService.getPasswordPolicy();

    if (policy && policy.enablePasswordPolicy) {
      const strengthCheck = await this.passwordPolicyValidationService.validatePasswordStrength(
        password,
        policy,
      );

      if (!strengthCheck.valid) {
        return SerializeHttpResponse(
          false,
          HttpStatus.BAD_REQUEST,
          strengthCheck.message || 'Password does not meet requirements',
        );
      }

      const historyCheck = await this.passwordPolicyValidationService.checkPasswordHistory(
        user.id,
        password,
        policy,
      );

      if (!historyCheck.valid) {
        return SerializeHttpResponse(
          false,
          HttpStatus.BAD_REQUEST,
          historyCheck.message || 'Password cannot be reused',
        );
      }
    }

    const hashedPassword = await createHashPassword(password);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      isPasswordResetDone: true,
    });

    if (policy && policy.enablePasswordPolicy) {
      await this.passwordPolicyValidationService.savePasswordToHistory(user.id, hashedPassword);
    }

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

    const policy = await this.passwordPolicyService.getPasswordPolicy();

    if (policy && policy.enablePasswordPolicy) {
      const minAgeCheck = await this.passwordPolicyValidationService.checkMinimumPasswordAge(
        user.id,
        policy,
      );

      if (!minAgeCheck.valid) {
        return SerializeHttpResponse(
          false,
          HttpStatus.BAD_REQUEST,
          minAgeCheck.message || 'Password cannot be changed yet',
        );
      }

      const strengthCheck = await this.passwordPolicyValidationService.validatePasswordStrength(
        newPassword,
        policy,
      );

      if (!strengthCheck.valid) {
        return SerializeHttpResponse(
          false,
          HttpStatus.BAD_REQUEST,
          strengthCheck.message || 'Password does not meet requirements',
        );
      }

      const historyCheck = await this.passwordPolicyValidationService.checkPasswordHistory(
        user.id,
        newPassword,
        policy,
      );

      if (!historyCheck.valid) {
        return SerializeHttpResponse(
          false,
          HttpStatus.BAD_REQUEST,
          historyCheck.message || 'Password cannot be reused',
        );
      }
    }

    const hashedPassword = await createHashPassword(newPassword);
    await this.userRepository.update(user.id, { password: hashedPassword });

    if (policy && policy.enablePasswordPolicy) {
      await this.passwordPolicyValidationService.savePasswordToHistory(user.id, hashedPassword);
    }

    return SerializeHttpResponse(true, HttpStatus.OK, 'Password changed successfully');
  }

  async me(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      return SerializeHttpResponse(false, HttpStatus.UNAUTHORIZED, 'User not found');
    }

    const passwordWarning =
      await this.passwordPolicyValidationService.checkPasswordExpiryWarning(id);

    const passwordExpiryCheck =
      await this.passwordPolicyValidationService.checkMaximumPasswordAge(id);

    const response = {
      ...user,
      passwordWarning: passwordWarning.warning
        ? {
            warning: true,
            daysUntilExpiry: passwordWarning.daysUntilExpiry,
          }
        : null,
      passwordExpired: passwordExpiryCheck.expired || false,
    };

    return SerializeHttpResponse(response, HttpStatus.OK, 'User details fetched successfully');
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
      response = await Http.get(url, { headers: { ...getCompanySecretKeyHeader() } });
    } catch (error) {
      return SerializeHttpResponse(false, HttpStatus.INTERNAL_SERVER_ERROR, error.message);
    }

    return SerializeHttpResponse(response.data, HttpStatus.OK, 'Company info fetched successfully');
  }
}
