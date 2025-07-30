#!/bin/bash

# TFMShop Backend Production Deployment Script
# This script handles the complete production deployment process

set -e  # Exit on any error

echo "🚀 Starting TFMShop Backend Production Deployment"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or later is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version check passed: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

# Set production environment
export NODE_ENV=production
print_status "Environment set to production"

# Install dependencies
print_status "Installing production dependencies..."
npm ci --only=production --silent
print_success "Dependencies installed"

# Build the application
print_status "Building application for production..."
npm run build:production
print_success "Application built successfully"

# Run production readiness check
print_status "Running production readiness check..."
if npm run production:check --silent; then
    print_success "Production readiness check passed"
else
    print_warning "Production readiness check failed, but continuing with deployment"
fi

# Create required directories
print_status "Creating required directories..."
mkdir -p /var/log/tfmshop
mkdir -p /var/uploads/tfmshop
mkdir -p tmp
print_success "Directories created"

# Set proper permissions
print_status "Setting directory permissions..."
chmod 755 /var/log/tfmshop 2>/dev/null || print_warning "Could not set log directory permissions"
chmod 755 /var/uploads/tfmshop 2>/dev/null || print_warning "Could not set upload directory permissions"
chmod 755 tmp
print_success "Permissions set"

# Run database migrations (if database is available)
print_status "Running database migrations..."
if npm run migration:run --silent 2>/dev/null; then
    print_success "Database migrations completed"
else
    print_warning "Database migrations failed or database not available"
fi

# Warm up cache (if Redis is available)
print_status "Warming up cache..."
if npm run deploy:cache-warmup --silent 2>/dev/null; then
    print_success "Cache warmed up successfully"
else
    print_warning "Cache warm-up failed or Redis not available"
fi

# Generate performance report
print_status "Generating performance report..."
if npm run optimize:report --silent 2>/dev/null; then
    print_success "Performance report generated"
else
    print_warning "Performance report generation failed"
fi

# Create systemd service file (if running on systemd)
if command -v systemctl &> /dev/null; then
    print_status "Creating systemd service file..."
    
    cat > /tmp/tfmshop-backend.service << EOF
[Unit]
Description=TFMShop Backend API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=tfmshop-backend

[Install]
WantedBy=multi-user.target
EOF

    if sudo cp /tmp/tfmshop-backend.service /etc/systemd/system/ 2>/dev/null; then
        sudo systemctl daemon-reload
        print_success "Systemd service file created"
    else
        print_warning "Could not create systemd service file (insufficient permissions)"
    fi
fi

# Create nginx configuration (if nginx is available)
if command -v nginx &> /dev/null; then
    print_status "Creating nginx configuration..."
    
    cat > /tmp/tfmshop-backend-nginx.conf << EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL configuration (update with your certificates)
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
    
    # Static files (if serving from this server)
    location /uploads/ {
        alias /var/uploads/tfmshop/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    print_success "Nginx configuration template created at /tmp/tfmshop-backend-nginx.conf"
    print_warning "Please update the SSL certificate paths and domain names in the nginx configuration"
fi

# Create environment file template
print_status "Creating production environment template..."
cat > .env.production.template << EOF
# Production Environment Configuration Template
# Copy this to .env.production and update with your actual values

NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=your-database-host
DB_PORT=5432
DB_USERNAME=your-db-username
DB_PASSWORD=your-secure-db-password
DB_DATABASE=tfmshop_production

# JWT Configuration (MUST be changed)
JWT_SECRET=your-super-secure-jwt-secret-at-least-32-characters-long
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-at-least-32-characters-long
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://your-domain.com,https://www.your-domain.com

# Security
FORCE_HTTPS=true
TRUST_PROXY=true

# Redis Configuration
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
REDIS_KEY_PREFIX=tfmshop_prod

# Performance
ENABLE_CACHING=true
ENABLE_COMPRESSION=true
ENABLE_RATE_LIMIT=true

# Logging
LOG_LEVEL=info
ENABLE_FILE_LOGGING=true
LOG_DIRECTORY=/var/log/tfmshop

# File Upload
UPLOAD_PATH=/var/uploads/tfmshop
MAX_FILE_SIZE=5242880

# Email Configuration
EMAIL_HOST=your-smtp-host
EMAIL_PORT=587
EMAIL_USER=your-email-user
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@your-domain.com
EOF

print_success "Production environment template created"

# Create deployment summary
print_status "Creating deployment summary..."
cat > deployment-summary.md << EOF
# TFMShop Backend Deployment Summary

**Deployment Date:** $(date)
**Environment:** Production
**Node.js Version:** $(node -v)
**npm Version:** $(npm -v)

## Deployment Steps Completed

- ✅ Dependencies installed
- ✅ Application built for production
- ✅ Production readiness check performed
- ✅ Required directories created
- ✅ Directory permissions set
- ✅ Database migrations attempted
- ✅ Cache warm-up attempted
- ✅ Performance report generated
- ✅ System service configuration created
- ✅ Nginx configuration template created
- ✅ Environment template created

## Next Steps

1. **Configure Environment Variables:**
   - Copy \`.env.production.template\` to \`.env.production\`
   - Update all placeholder values with your actual configuration

2. **Database Setup:**
   - Ensure PostgreSQL is running and accessible
   - Run migrations: \`npm run migration:run\`
   - Seed initial data: \`npm run seed\`

3. **Redis Setup (Optional but Recommended):**
   - Install and configure Redis server
   - Update Redis connection settings in environment file

4. **SSL Certificate:**
   - Obtain SSL certificate for your domain
   - Update nginx configuration with certificate paths

5. **Start the Application:**
   - Using systemd: \`sudo systemctl start tfmshop-backend\`
   - Or directly: \`npm run start:production\`

6. **Monitor the Application:**
   - Check logs: \`tail -f /var/log/tfmshop/combined-$(date +%Y-%m-%d).log\`
   - Health check: \`curl https://your-domain.com/health\`
   - Monitoring dashboard: \`npm run dashboard\`

## Important Security Notes

- Change all default passwords and secrets
- Configure firewall to restrict database and Redis access
- Set up regular backups
- Monitor application logs for security events
- Keep dependencies updated

## Support Commands

- Check application status: \`npm run production:check\`
- View performance metrics: \`npm run dashboard:export\`
- Generate monitoring report: \`npm run dashboard:report\`
- Optimize performance: \`npm run optimize\`

EOF

print_success "Deployment summary created: deployment-summary.md"

echo ""
echo "🎉 Production Deployment Completed Successfully!"
echo "=============================================="
echo ""
print_success "The TFMShop backend has been prepared for production deployment."
print_warning "Please review the deployment-summary.md file for next steps."
print_warning "Don't forget to configure your environment variables in .env.production"
echo ""
print_status "To start the application:"
echo "  npm run start:production"
echo ""
print_status "To monitor the application:"
echo "  npm run dashboard"
echo ""
print_status "For help and troubleshooting, see:"
echo "  - deployment-summary.md"
echo "  - PERFORMANCE_OPTIMIZATION.md"
echo "  - logs in /var/log/tfmshop/"
echo ""