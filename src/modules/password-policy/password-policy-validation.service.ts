import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PasswordPolicyService } from './password-policy.service';
import { PasswordHistory } from 'src/entities/password-history.entity';
import { UserLockout } from 'src/entities/user-lockout.entity';
import { User } from 'src/entities/user.entity';
import { PasswordPolicy } from 'src/types/password-policy.type';
import { verifyPassword } from 'src/utils/auth.util';
import { DB_NAME } from 'src/constants/db.constant';

@Injectable()
export class PasswordPolicyValidationService {
  constructor(
    private readonly passwordPolicyService: PasswordPolicyService,
    @InjectRepository(PasswordHistory, DB_NAME)
    private readonly passwordHistoryRepository: Repository<PasswordHistory>,
    @InjectRepository(UserLockout, DB_NAME)
    private readonly userLockoutRepository: Repository<UserLockout>,
    @InjectRepository(User, DB_NAME)
    private readonly userRepository: Repository<User>,
  ) {}

  async validatePasswordStrength(
    password: string,
    policy: PasswordPolicy,
  ): Promise<{ valid: boolean; message?: string }> {
    if (!policy.enablePasswordPolicy) {
      return { valid: true };
    }

    if (password.length < policy.minPasswordLength) {
      return {
        valid: false,
        message: `Password must be at least ${policy.minPasswordLength} characters long`,
      };
    }

    if (policy.requireUpperCase && !/[A-Z]/.test(password)) {
      return {
        valid: false,
        message: 'Password must contain at least one uppercase letter',
      };
    }

    if (policy.requireLowerCase && !/[a-z]/.test(password)) {
      return {
        valid: false,
        message: 'Password must contain at least one lowercase letter',
      };
    }

    if (policy.requireNumeric && !/[0-9]/.test(password)) {
      return {
        valid: false,
        message: 'Password must contain at least one number',
      };
    }

    if (policy.requireNonAlphaNumeric && !/[^a-zA-Z0-9]/.test(password)) {
      return {
        valid: false,
        message: 'Password must contain at least one special character',
      };
    }

    return { valid: true };
  }

  async checkPasswordHistory(
    userId: string,
    newPassword: string,
    policy: PasswordPolicy,
  ): Promise<{ valid: boolean; message?: string }> {
    if (!policy.enablePasswordPolicy || policy.enforcedPasswordHistory === 0) {
      return { valid: true };
    }

    const recentPasswords = await this.passwordHistoryRepository.find({
      where: { userId },
      order: { changedAt: 'DESC' },
      take: policy.enforcedPasswordHistory,
    });

    for (const passwordHistory of recentPasswords) {
      const isMatch = await verifyPassword(newPassword, passwordHistory.hashedPassword);
      if (isMatch) {
        return {
          valid: false,
          message: `You cannot reuse your last ${policy.enforcedPasswordHistory} password(s)`,
        };
      }
    }

    return { valid: true };
  }

  async checkMinimumPasswordAge(
    userId: string,
    policy: PasswordPolicy,
  ): Promise<{ valid: boolean; message?: string }> {
    if (!policy.enablePasswordPolicy || policy.minPasswordAge === 0) {
      return { valid: true };
    }

    const lastPasswordChange = await this.passwordHistoryRepository.findOne({
      where: { userId },
      order: { changedAt: 'DESC' },
    });

    if (!lastPasswordChange) {
      return { valid: true };
    }

    const daysSinceChange = Math.floor(
      (Date.now() - lastPasswordChange.changedAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceChange < policy.minPasswordAge) {
      const remainingDays = policy.minPasswordAge - daysSinceChange;
      return {
        valid: false,
        message: `You cannot change your password for ${remainingDays} more day(s)`,
      };
    }

    return { valid: true };
  }

  async checkMaximumPasswordAge(userId: string): Promise<{
    expired: boolean;
    daysUntilExpiry?: number;
    policy?: PasswordPolicy;
  }> {
    const policy = await this.passwordPolicyService.getPasswordPolicy();

    if (!policy || !policy.enablePasswordPolicy || policy.maxPasswordAge === 0) {
      return { expired: false };
    }

    const lastPasswordChange = await this.passwordHistoryRepository.findOne({
      where: { userId },
      order: { changedAt: 'DESC' },
    });

    if (!lastPasswordChange) {
      return { expired: false };
    }

    const daysSinceChange = Math.floor(
      (Date.now() - lastPasswordChange.changedAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    const daysUntilExpiry = policy.maxPasswordAge - daysSinceChange;

    return {
      expired: daysSinceChange >= policy.maxPasswordAge,
      daysUntilExpiry: daysUntilExpiry > 0 ? daysUntilExpiry : 0,
      policy,
    };
  }

  async checkPasswordExpiryWarning(userId: string): Promise<{
    warning: boolean;
    daysUntilExpiry?: number;
  }> {
    const expiryCheck = await this.checkMaximumPasswordAge(userId);

    if (!expiryCheck.policy || !expiryCheck.policy.passwordChangeWarning) {
      return { warning: false };
    }

    if (expiryCheck.expired) {
      return { warning: true, daysUntilExpiry: 0 };
    }

    const shouldWarn =
      expiryCheck.daysUntilExpiry !== undefined &&
      expiryCheck.daysUntilExpiry <= expiryCheck.policy.passwordChangeWarning;

    return {
      warning: shouldWarn || false,
      daysUntilExpiry: expiryCheck.daysUntilExpiry,
    };
  }

  async savePasswordToHistory(userId: string, hashedPassword: string): Promise<void> {
    await this.passwordHistoryRepository.save({
      userId,
      hashedPassword,
      changedAt: new Date(),
    });
  }

  async checkAccountLockout(userId: string): Promise<{
    locked: boolean;
    lockedUntil?: Date;
    message?: string;
  }> {
    const policy = await this.passwordPolicyService.getPasswordPolicy();

    console.log('policy', policy);

    if (!policy || !policy.enableLockoutPolicy) {
      return { locked: false };
    }

    const lockout = await this.userLockoutRepository.findOne({
      where: { userId },
    });

    if (!lockout) {
      return { locked: false };
    }

    // Check if account is currently locked
    if (lockout.lockedUntil && new Date() < lockout.lockedUntil) {
      const minutesRemaining = Math.ceil(
        (lockout.lockedUntil.getTime() - Date.now()) / (1000 * 60),
      );
      return {
        locked: true,
        lockedUntil: lockout.lockedUntil,
        message: `Account is locked. Please try again after ${minutesRemaining} minute(s)`,
      };
    }

    // If lockout period has expired, allow login attempt but keep lockoutCount
    // The lockoutCount will only be reset on successful login
    if (lockout.lockedUntil && new Date() >= lockout.lockedUntil) {
      await this.userLockoutRepository.update(lockout.id, {
        failedAttempts: 0,
        lockedUntil: null,
      });
      return { locked: false };
    }

    return { locked: false };
  }

  async recordFailedLoginAttempt(userId: string): Promise<void> {
    const policy = await this.passwordPolicyService.getPasswordPolicy();

    if (!policy || !policy.enableLockoutPolicy) {
      return;
    }

    let lockout = await this.userLockoutRepository.findOne({ where: { userId } });

    if (!lockout) {
      lockout = this.userLockoutRepository.create({
        userId,
        failedAttempts: 0,
        lockoutCount: 0,
      });
    }

    const now = new Date();

    // Check if resetLockoutThreshold time has passed since last failed attempt
    if (lockout.lastFailedAttemptAt && policy.resetLockoutThreshold > 0) {
      const minutesSinceLastAttempt = Math.floor(
        (now.getTime() - lockout.lastFailedAttemptAt.getTime()) / (1000 * 60),
      );

      // Reset failed attempts if threshold time has passed
      if (minutesSinceLastAttempt >= policy.resetLockoutThreshold) {
        lockout.failedAttempts = 0;
      }
    }

    lockout.failedAttempts += 1;
    lockout.lastFailedAttemptAt = now;

    // Check if user should be locked out
    if (lockout.failedAttempts >= policy.maxLockoutThresholdAge) {
      // Increment lockout count for progressive lockout duration
      lockout.lockoutCount += 1;

      // Calculate progressive lockout duration: lockoutDuration * lockoutCount
      const progressiveDuration = policy.lockoutDuration * lockout.lockoutCount;
      lockout.lockedUntil = new Date(now.getTime() + progressiveDuration * 60 * 1000);

      // Reset failed attempts after locking
      lockout.failedAttempts = 0;
    }

    await this.userLockoutRepository.save(lockout);
  }

  async resetFailedLoginAttempts(userId: string): Promise<void> {
    const lockout = await this.userLockoutRepository.findOne({
      where: { userId },
    });

    if (lockout) {
      await this.userLockoutRepository.update(lockout.id, {
        failedAttempts: 0,
        lockoutCount: 0,
        lockedUntil: null,
        lastFailedAttemptAt: null,
      });
    }
  }
}
