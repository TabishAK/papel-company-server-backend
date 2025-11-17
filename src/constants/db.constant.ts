import { User } from 'src/entities/user.entity';
import { Otp } from 'src/entities/otp.entity';
import { PasswordHistory } from 'src/entities/password-history.entity';
import { UserLockout } from 'src/entities/user-lockout.entity';

export const COMPANY_DATABASE_ENTITIES = [User, Otp, PasswordHistory, UserLockout];

export const DB_NAME = 'company_database';
