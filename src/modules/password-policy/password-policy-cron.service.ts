import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DB_NAME } from 'src/constants/db.constant';
import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EMAIL_SUBJECT } from 'src/constants/responses/email.response';
import { PasswordPolicyValidationService } from './password-policy-validation.service';

@Injectable()
export class PasswordPolicyCronService {
  private readonly logger = new Logger(PasswordPolicyCronService.name);

  constructor(
    @InjectRepository(User, DB_NAME)
    private readonly userRepository: Repository<User>,
    private readonly passwordPolicyValidationService: PasswordPolicyValidationService,
    private readonly emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkPasswordExpiryWarnings() {
    this.logger.log('Starting password expiry warning check');

    try {
      const users = await this.userRepository.find({
        where: { isActive: true, isPasswordResetDone: true },
      });

      for (const user of users) {
        const warningCheck = await this.passwordPolicyValidationService.checkPasswordExpiryWarning(
          user.id,
        );

        if (warningCheck.warning && warningCheck.daysUntilExpiry !== undefined) {
          try {
            let bodyHtml: string;
            try {
              bodyHtml = await this.emailService.loadTemplate('password-expiry-warning', {
                daysUntilExpiry: warningCheck.daysUntilExpiry,
                userName: user.fullName || user.email,
              });
            } catch {
              bodyHtml = `
                <h2>Password Expiry Warning</h2>
                <p>Hello ${user.fullName || user.email},</p>
                <p>Your password will expire in ${warningCheck.daysUntilExpiry} day(s).</p>
                <p>Please change your password before it expires to avoid account lockout.</p>
              `;
            }

            await this.emailService.sendEmail(
              user.email,
              EMAIL_SUBJECT.PASSWORD_EXPIRY_WARNING,
              bodyHtml,
            );

            this.logger.log(
              `Password expiry warning sent to user ${user.email} - ${warningCheck.daysUntilExpiry} days remaining`,
            );
          } catch (error) {
            this.logger.error(`Failed to send warning email to ${user.email}:`, error);
          }
        }
      }

      this.logger.log('Password expiry warning check completed');
    } catch (error) {
      this.logger.error('Error in password expiry warning check:', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkExpiredPasswords() {
    this.logger.log('Starting expired password check');

    try {
      const users = await this.userRepository.find({
        where: { isActive: true, isPasswordResetDone: true },
      });

      for (const user of users) {
        const expiryCheck = await this.passwordPolicyValidationService.checkMaximumPasswordAge(
          user.id,
        );

        if (expiryCheck.expired) {
          try {
            let bodyHtml: string;
            try {
              bodyHtml = await this.emailService.loadTemplate('password-expired', {
                userName: user.fullName || user.email,
              });
            } catch {
              bodyHtml = `
                <h2>Password Expired</h2>
                <p>Hello ${user.fullName || user.email},</p>
                <p>Your password has expired. Please reset your password to continue using your account.</p>
                <p>You will be required to reset your password on your next login.</p>
              `;
            }

            await this.emailService.sendEmail(user.email, EMAIL_SUBJECT.PASSWORD_EXPIRED, bodyHtml);

            this.logger.log(`Password expired notification sent to user ${user.email}`);
          } catch (error) {
            this.logger.error(`Failed to send expired password email to ${user.email}:`, error);
          }
        }
      }

      this.logger.log('Expired password check completed');
    } catch (error) {
      this.logger.error('Error in expired password check:', error);
    }
  }
}
