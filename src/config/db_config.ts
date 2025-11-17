import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm';
import { CONFIG } from 'src/constants/config.constant';
import { COMPANY_DATABASE_ENTITIES, DB_NAME } from 'src/constants/db.constant';

if (!process.env[CONFIG.NODE_ENV]) {
  process.env[CONFIG.NODE_ENV] = 'development';
}

const envFile = process.env[CONFIG.NODE_ENV] === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({ path: envFile });

export const getDatabaseConfig = (): DataSourceOptions => {
  const config: DataSourceOptions = {
    type: 'mysql',
    name: DB_NAME,
    entities: COMPANY_DATABASE_ENTITIES,
    host: process.env[CONFIG.SYSTEM_DB_HOST] || '127.0.0.1',
    port: parseInt(process.env[CONFIG.SYSTEM_DB_PORT] || '3306'),
    username: process.env[CONFIG.SYSTEM_DB_USERNAME] || 'papel-admin',
    password: process.env[CONFIG.SYSTEM_DB_PASSWORD] || '1234',
    database: process.env[CONFIG.SYSTEM_DB_NAME] || DB_NAME,
    migrations: [__dirname + `/../migrations/${DB_NAME}/*{.ts,.js}`],
    synchronize: true,
    timezone: 'Z',
    logging: false,
    ssl: false,
    migrationsRun: true,
  };

  return config;
};

const dataSource = new DataSource({ ...getDatabaseConfig() });

export default dataSource;
