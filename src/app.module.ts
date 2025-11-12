import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { getDatabaseConfig } from './config/db_config';
import { CONFIG } from './constants/config.constant';
import { MediaModule } from './modules/media/media.module';
import { AuthController } from './modules/auth/auth.controller';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: `.env.${process.env[CONFIG.NODE_ENV]}`,
    }),
    MediaModule,
    AuthModule,
    TypeOrmModule.forRoot(getDatabaseConfig()),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
