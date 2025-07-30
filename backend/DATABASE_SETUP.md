# Database Setup Documentation

## Overview

This document describes the database configuration and setup implemented for the TFMshop backend.

## Components Implemented

### 1. TypeORM Configuration (`src/config/database.ts`)

- **AppDataSource**: Main TypeORM DataSource configuration for PostgreSQL
- **initializeDatabase()**: Function to initialize database connection with error handling
- **closeDatabase()**: Function to gracefully close database connection
- **checkDatabaseHealth()**: Function to verify database connection status

### 2. Base Entity (`src/entities/BaseEntity.ts`)

Abstract base class that provides common fields for all entities:
- `id`: UUID primary key (auto-generated)
- `createdAt`: Timestamp of record creation
- `updatedAt`: Timestamp of last record update

All entities should extend this base class to inherit these common fields.

### 3. Database Utilities (`src/utils/database.ts`)

Helper functions for database operations:
- **withTransaction()**: Execute functions within database transactions
- **tableExists()**: Check if a table exists in the database
- **getConnectionInfo()**: Get current database connection information
- **executeQuery()**: Execute raw SQL queries safely
- **clearTables()**: Clear data from specified tables (useful for testing)

### 4. Migration Support

- Migration directory structure created (`src/migrations/`)
- TypeORM CLI configuration (`ormconfig.ts`)
- NPM scripts for migration operations:
  - `npm run migration:generate` - Generate new migration
  - `npm run migration:create` - Create empty migration
  - `npm run migration:run` - Run pending migrations
  - `npm run migration:revert` - Revert last migration

## Configuration

### Environment Variables

The following environment variables are used for database configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=tfmshop
```

### Database Features

- **Connection Pooling**: Configured with min/max connections and timeouts
- **SSL Support**: Enabled in production environments
- **Logging**: Query logging enabled in development mode
- **Synchronization**: Auto-sync enabled in development (disabled in production)
- **Migrations**: Automatic migration running in production

## Usage

### Starting the Application

The database connection is automatically initialized when the application starts:

```typescript
import { initializeDatabase } from './config/database';

await initializeDatabase();
```

### Creating Entities

Extend the BaseEntity class for all database entities:

```typescript
import { Entity, Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@Entity()
export class User extends BaseEntity {
  @Column()
  email: string;

  @Column()
  name: string;
}
```

### Using Database Utilities

```typescript
import { DatabaseUtils } from '../utils/database';

// Execute within transaction
const result = await DatabaseUtils.withTransaction(async (queryRunner) => {
  // Your transactional operations here
  return await queryRunner.query('SELECT * FROM users');
});

// Check table existence
const exists = await DatabaseUtils.tableExists('users');

// Execute raw query
const result = await DatabaseUtils.executeQuery('SELECT COUNT(*) FROM users');
```

## Health Monitoring

The application includes a health check endpoint at `/health` that reports:
- Database connection status
- Connection details
- System uptime and memory usage

## Testing

Tests are configured to gracefully handle database unavailability:
- Database-dependent tests are skipped when PostgreSQL is not running
- Base entity tests verify TypeORM decorator functionality
- Health check tests accommodate both connected and disconnected states

## Production Considerations

- SSL connections are enabled in production
- Database migrations run automatically on startup
- Connection pooling is optimized for production load
- Comprehensive error handling and logging
- Graceful shutdown handling for database connections