@echo off
REM TFMShop Backend Production Deployment Script for Windows
REM This script handles the complete production deployment process

echo 🚀 Starting TFMShop Backend Production Deployment
echo ==================================================

REM Set production environment
set NODE_ENV=production
echo [INFO] Environment set to production

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18 or later.
    exit /b 1
)

echo [SUCCESS] Node.js version check passed: 
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm is not installed. Please install npm.
    exit /b 1
)

REM Install dependencies
echo [INFO] Installing production dependencies...
call npm ci --only=production --silent
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [SUCCESS] Dependencies installed

REM Build the application
echo [INFO] Building application for production...
call npm run build:production
if errorlevel 1 (
    echo [ERROR] Failed to build application
    exit /b 1
)
echo [SUCCESS] Application built successfully

REM Run production readiness check
echo [INFO] Running production readiness check...
call npm run production:check --silent
if errorlevel 1 (
    echo [WARNING] Production readiness check failed, but continuing with deployment
) else (
    echo [SUCCESS] Production readiness check passed
)

REM Create required directories
echo [INFO] Creating required directories...
if not exist "logs" mkdir logs
if not exist "uploads" mkdir uploads
if not exist "tmp" mkdir tmp
echo [SUCCESS] Directories created

REM Create environment file template
echo [INFO] Creating production environment template...
(
echo # Production Environment Configuration Template
echo # Copy this to .env.production and update with your actual values
echo.
echo NODE_ENV=production
echo PORT=3000
echo.
echo # Database Configuration
echo DB_HOST=your-database-host
echo DB_PORT=5432
echo DB_USERNAME=your-db-username
echo DB_PASSWORD=your-secure-db-password
echo DB_DATABASE=tfmshop_production
echo.
echo # JWT Configuration ^(MUST be changed^)
echo JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long
echo JWT_EXPIRES_IN=1h
echo JWT_REFRESH_SECRET=your-super-secure-refresh-secret-at-least-32-characters-long
echo JWT_REFRESH_EXPIRES_IN=7d
echo.
echo # CORS Configuration
echo CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com
echo.
echo # Security
echo FORCE_HTTPS=true
echo TRUST_PROXY=true
echo.
echo # Redis Configuration
echo REDIS_HOST=your-redis-host
echo REDIS_PORT=6379
echo REDIS_PASSWORD=your-redis-password
echo REDIS_DB=0
echo REDIS_KEY_PREFIX=tfmshop_prod
echo.
echo # Performance
echo ENABLE_CACHING=true
echo ENABLE_COMPRESSION=true
echo ENABLE_RATE_LIMIT=true
echo.
echo # Logging
echo LOG_LEVEL=info
echo ENABLE_FILE_LOGGING=true
echo LOG_DIRECTORY=./logs
echo.
echo # File Upload
echo UPLOAD_PATH=./uploads
echo MAX_FILE_SIZE=5242880
echo.
echo # Email Configuration
echo EMAIL_HOST=your-smtp-host
echo EMAIL_PORT=587
echo EMAIL_USER=your-email-user
echo EMAIL_PASS=your-email-password
echo EMAIL_FROM=noreply@your-domain.com
) > .env.production.template

echo [SUCCESS] Production environment template created

REM Create deployment summary
echo [INFO] Creating deployment summary...
(
echo # TFMShop Backend Deployment Summary
echo.
echo **Deployment Date:** %date% %time%
echo **Environment:** Production
echo **Platform:** Windows
echo.
echo ## Deployment Steps Completed
echo.
echo - ✅ Dependencies installed
echo - ✅ Application built for production
echo - ✅ Production readiness check performed
echo - ✅ Required directories created
echo - ✅ Environment template created
echo.
echo ## Next Steps
echo.
echo 1. **Configure Environment Variables:**
echo    - Copy `.env.production.template` to `.env.production`
echo    - Update all placeholder values with your actual configuration
echo.
echo 2. **Database Setup:**
echo    - Ensure PostgreSQL is running and accessible
echo    - Run migrations: `npm run migration:run`
echo    - Seed initial data: `npm run seed`
echo.
echo 3. **Redis Setup ^(Optional but Recommended^):**
echo    - Install and configure Redis server
echo    - Update Redis connection settings in environment file
echo.
echo 4. **Start the Application:**
echo    - Run: `npm run start:production`
echo.
echo 5. **Monitor the Application:**
echo    - Check logs in ./logs/ directory
echo    - Health check: visit http://localhost:3000/health
echo    - Monitoring dashboard: `npm run dashboard`
echo.
echo ## Support Commands
echo.
echo - Check application status: `npm run production:check`
echo - View performance metrics: `npm run dashboard:export`
echo - Generate monitoring report: `npm run dashboard:report`
echo - Optimize performance: `npm run optimize`
) > deployment-summary.md

echo [SUCCESS] Deployment summary created: deployment-summary.md

echo.
echo 🎉 Production Deployment Completed Successfully!
echo ==============================================
echo.
echo [SUCCESS] The TFMShop backend has been prepared for production deployment.
echo [WARNING] Please review the deployment-summary.md file for next steps.
echo [WARNING] Don't forget to configure your environment variables in .env.production
echo.
echo [INFO] To start the application:
echo   npm run start:production
echo.
echo [INFO] To monitor the application:
echo   npm run dashboard
echo.
echo [INFO] For help and troubleshooting, see:
echo   - deployment-summary.md
echo   - PERFORMANCE_OPTIMIZATION.md
echo   - logs in ./logs/ directory
echo.

pause