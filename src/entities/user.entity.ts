import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { USER_ROLE } from 'src/constants/user.constant';
import { TABLE_NAME } from 'src/constants/table-name.constant';

@Entity(TABLE_NAME.USER)
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255, nullable: true })
  password: string;

  @Column({ nullable: true, length: 500 })
  profilePicture: string;

  @Column({ type: 'enum', enum: USER_ROLE })
  role: USER_ROLE;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isPasswordResetDone: boolean;

  @Column({ length: 255, nullable: true })
  fullName: string;

  @Column({ type: 'varchar', nullable: true })
  address: string;

  @Column({ type: 'int', nullable: true })
  securityLevel: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  contactNumber: string;

  @Column({ type: 'varchar', nullable: true })
  companyId: string;

  @Column({ type: 'varchar', nullable: true })
  departmentId: string;

  @Column({ type: 'varchar', nullable: true })
  sectionId: string;

  @Column({ type: 'varchar', nullable: true })
  temporaryPassword: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
