import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { EmailModule } from '../email/email.module';
import { UserLockout } from 'src/entities/user-lockout.entity';
import { PasswordPolicyService } from './password-policy.service';
import { PasswordHistory } from 'src/entities/password-history.entity';
import { PasswordPolicyCronService } from './password-policy-cron.service';
import { PasswordPolicyValidationService } from './password-policy-validation.service';
import { DB_NAME } from 'src/constants/db.constant';

const COMPANY_DATABASE_ENTITIES = [PasswordHistory, UserLockout, User];

@Module({
  imports: [TypeOrmModule.forFeature(COMPANY_DATABASE_ENTITIES, DB_NAME), EmailModule],
  providers: [PasswordPolicyService, PasswordPolicyValidationService, PasswordPolicyCronService],
  exports: [PasswordPolicyService, PasswordPolicyValidationService],
})
export class PasswordPolicyModule {}
