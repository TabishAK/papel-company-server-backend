export interface PasswordPolicy {
  enablePasswordPolicy: boolean;
  enforcedPasswordHistory: number;
  passwordChangeWarning: number;
  maxPasswordAge: number;
  minPasswordAge: number;
  minPasswordLength: number;
  requireUpperCase: boolean;
  requireNumeric: boolean;
  requireLowerCase: boolean;
  requireNonAlphaNumeric: boolean;
  enableLockoutPolicy: boolean;
  lockoutDuration: number;
  maxLockoutThresholdAge: number;
  resetLockoutThreshold: number;
  // maxLockoutThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}
