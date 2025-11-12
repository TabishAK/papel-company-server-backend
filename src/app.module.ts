import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { CONFIG } from './constants/config.constant';
import { getDatabaseConfig } from './config/db_config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { MediaModule } from './modules/media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: `.env.${process.env[CONFIG.NODE_ENV]}`,
    }),
    MediaModule,
    AuthModule,
    UserModule,
    TypeOrmModule.forRoot(getDatabaseConfig()),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
