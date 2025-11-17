import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MediaModule } from '../media/media.module';
import { DB_NAME } from 'src/constants/db.constant';

@Module({
  imports: [TypeOrmModule.forFeature([User], DB_NAME), MediaModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
