import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { getSystemDatabaseConfig } from './config/db_config';
import { CONFIG } from './constants/config.constant';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: `.env.${process.env[CONFIG.NODE_ENV]}`,
    }),
    TypeOrmModule.forRoot(getSystemDatabaseConfig()),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
