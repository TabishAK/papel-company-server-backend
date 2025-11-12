import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TABLE_NAME } from 'src/constants/table-name.constant';
import { OTP_STATUS, OTP_TYPE } from 'src/constants/otp.constant';

@Entity(TABLE_NAME.OTP)
export class Otp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 6 })
  otp: string;

  @Column({ type: 'enum', enum: OTP_TYPE })
  type: OTP_TYPE;

  @Column({
    type: 'enum',
    enum: OTP_STATUS,
    default: OTP_STATUS.PENDING,
  })
  status: OTP_STATUS;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
