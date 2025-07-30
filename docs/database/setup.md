# Database Setup

## Database Configuration

TMF Shop supports both PostgreSQL and MySQL databases.

### PostgreSQL Setup (Recommended)

1. **Install PostgreSQL**
   - Download from [postgresql.org](https://www.postgresql.org/download/)
   - Or use Docker: `docker run --name tmfshop-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Create Database**
   ```sql
   CREATE DATABASE tmfshop;
   CREATE USER tmfshop_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE tmfshop TO tmfshop_user;
   ```

3. **Environment Configuration**
   ```env
   DB_TYPE=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=tmfshop_user
   DB_PASSWORD=your_password
   DB_DATABASE=tmfshop
   ```

### MySQL Setup

1. **Install MySQL**
   - Download from [mysql.com](https://dev.mysql.com/downloads/)
   - Or use Docker: `docker run --name tmfshop-mysql -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:8.0`

2. **Create Database**
   ```sql
   CREATE DATABASE tmfshop;
   CREATE USER 'tmfshop_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON tmfshop.* TO 'tmfshop_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Environment Configuration**
   ```env
   DB_TYPE=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=tmfshop_user
   DB_PASSWORD=your_password
   DB_DATABASE=tmfshop
   ```

## Migrations

### Running Migrations

```bash
cd backend

# Run all pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Creating New Migrations

```bash
# Generate a new migration file
npm run migration:generate -- -n MigrationName

# Create an empty migration file
npm run migration:create -- -n MigrationName
```

### Migration Best Practices

1. **Always backup** your database before running migrations in production
2. **Test migrations** on a copy of production data
3. **Keep migrations small** and focused on a single change
4. **Don't modify existing migrations** that have been run in production
5. **Use transactions** for data migrations

## Database Schema

### Core Entities

#### User
```sql
CREATE TABLE "user" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" varchar UNIQUE NOT NULL,
    "password" varchar NOT NULL,
    "firstName" varchar NOT NULL,
    "lastName" varchar NOT NULL,
    "role" varchar DEFAULT 'user',
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp DEFAULT NOW(),
    "updatedAt" timestamp DEFAULT NOW()
);
```

#### Product (Future)
```sql
CREATE TABLE "product" (
    "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" varchar NOT NULL,
    "description" text,
    "price" decimal(10,2) NOT NULL,
    "categoryId" uuid,
    "imageUrl" varchar,
    "stock" integer DEFAULT 0,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp DEFAULT NOW(),
    "updatedAt" timestamp DEFAULT NOW()
);
```

## Database Maintenance

### Backup

```bash
# PostgreSQL
pg_dump -h localhost -U tmfshop_user tmfshop > backup.sql

# MySQL
mysqldump -h localhost -u tmfshop_user -p tmfshop > backup.sql
```

### Restore

```bash
# PostgreSQL
psql -h localhost -U tmfshop_user tmfshop < backup.sql

# MySQL
mysql -h localhost -u tmfshop_user -p tmfshop < backup.sql
```

### Performance Optimization

1. **Add indexes** on frequently queried columns
2. **Analyze query performance** using EXPLAIN
3. **Regular maintenance** (VACUUM for PostgreSQL, OPTIMIZE for MySQL)
4. **Monitor slow queries**

## Troubleshooting

### Common Issues

**Connection refused**
- Check if database server is running
- Verify host and port settings
- Check firewall settings

**Authentication failed**
- Verify username and password
- Check user permissions
- Ensure user can connect from the specified host

**Migration errors**
- Check migration files for syntax errors
- Ensure database user has sufficient permissions
- Verify database schema state
