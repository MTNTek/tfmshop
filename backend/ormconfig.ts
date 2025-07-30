import { DataSource } from 'typeorm';
import { config } from './src/config/env';
import path from 'path';

/**
 * TypeORM CLI configuration
 * This file is used by TypeORM CLI commands for migrations and other operations
 */
export default new DataSource({
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: false, // Always false for CLI operations
  logging: true,
  entities: [path.join(__dirname, 'src/entities/**/*.ts')],
  migrations: [path.join(__dirname, 'src/migrations/**/*.ts')],
  subscribers: [path.join(__dirname, 'src/subscribers/**/*.ts')],
});