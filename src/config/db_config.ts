import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm';
import { CONFIG } from 'src/constants/config.constant';
import { COMPANY_DATABASE_ENTITIES } from 'src/constants/db.constant';

if (!process.env[CONFIG.NODE_ENV]) {
  process.env[CONFIG.NODE_ENV] = 'development';
}

const envFile = process.env[CONFIG.NODE_ENV] === 'production' ? '.env.prod' : '.env.dev';
dotenv.config({ path: envFile });

export const getSystemDatabaseConfig = (): DataSourceOptions => {
  const config: DataSourceOptions = {
    type: 'mysql',
    name: 'company_database',
    entities: COMPANY_DATABASE_ENTITIES,
    host: process.env[CONFIG.SYSTEM_DB_HOST] || '127.0.0.1',
    port: parseInt(process.env[CONFIG.SYSTEM_DB_PORT] || '3306'),
    username: process.env[CONFIG.SYSTEM_DB_USERNAME] || 'papel-admin',
    password: process.env[CONFIG.SYSTEM_DB_PASSWORD] || '1234',
    database: process.env[CONFIG.SYSTEM_DB_NAME] || 'company_database',
    migrations: [__dirname + '/../migrations/company_database/*{.ts,.js}'],
    synchronize: true,
    timezone: 'Z',
    logging: false,
    ssl: false,
    migrationsRun: true,
  };

  return config;
};

const dataSource = new DataSource({ ...getSystemDatabaseConfig() });

export default dataSource;
