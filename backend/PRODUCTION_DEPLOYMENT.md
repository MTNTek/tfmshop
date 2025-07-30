# Production Deployment Guide

This guide covers deploying the TFMshop backend API to production with performance optimizations and monitoring.

## Prerequisites

- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+
- PM2 (for process management)
- Nginx (for reverse proxy)

## Performance Features

### Database Optimizations
- **Indexes**: Comprehensive indexing for all major query patterns
- **Full-text search**: PostgreSQL GIN indexes for product search
- **Composite indexes**: Optimized for common filter combinations
- **Connection pooling**: Efficient database connection management

### Caching Layer
- **Redis integration**: Distributed caching for frequently accessed data
- **Smart cache keys**: Hierarchical cache key structure
- **Cache invalidation**: Automatic cache clearing on data updates
- **Configurable TTL**: Different cache durations for different data types

### Security & Rate Limiting
- **Helmet.js**: Security headers and protection
- **Rate limiting**: Configurable rate limits per endpoint type
- **Input sanitization**: XSS and injection protection
- **CORS configuration**: Secure cross-origin resource sharing

### Monitoring & Logging
- **Winston logging**: Structured logging with rotation
- **Performance monitoring**: Memory, database, and cache metrics
- **Health checks**: Comprehensive system health endpoints
- **Error tracking**: Detailed error logging and reporting

## Environment Configuration

### Required Environment Variables

```bash
# Server
NODE_ENV=production
PORT=3000

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=your-db-user
DB_PASSWORD=your-secure-password
DB_DATABASE=tfmshop

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# Performance
ENABLE_CACHING=true
ENABLE_COMPRESSION=true
ENABLE_RATE_LIMIT=true

# Logging
LOG_LEVEL=warn
ENABLE_FILE_LOGGING=true
LOG_DIRECTORY=/var/log/tfmshop
```

## Deployment Options

### Option 1: Docker Deployment (Recommended)

1. **Build and run with Docker Compose:**
```bash
# Clone repository
git clone <your-repo>
cd tfmshop/backend

# Copy and configure environment
cp .env.example .env
# Edit .env with your production values

# Build and start services
docker-compose up -d

# Run database migrations
docker-compose exec backend npm run migration:run

# Seed initial data (optional)
docker-compose exec backend npm run seed
```

2. **Services included:**
- Backend API (Node.js)
- PostgreSQL database
- Redis cache
- Nginx reverse proxy

### Option 2: PM2 Deployment

1. **Install dependencies:**
```bash
npm install -g pm2
```

2. **Deploy application:**
```bash
# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
```

3. **Configure Nginx:**
```bash
# Copy nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/tfmshop
sudo ln -s /etc/nginx/sites-available/tfmshop /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Database Setup

### 1. Create Database
```sql
CREATE DATABASE tfmshop;
CREATE USER tfmshop WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE tfmshop TO tfmshop;
```

### 2. Run Migrations
```bash
npm run migration:run
```

### 3. Seed Data (Optional)
```bash
npm run seed
```

## Performance Tuning

### Database Configuration
```sql
-- PostgreSQL configuration recommendations
-- Add to postgresql.conf

# Memory
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB

# Connections
max_connections = 100

# Logging
log_min_duration_statement = 1000  # Log slow queries
```

### Redis Configuration
```bash
# redis.conf recommendations
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### Node.js Optimization
```bash
# Environment variables for production
NODE_OPTIONS="--max-old-space-size=1024"
UV_THREADPOOL_SIZE=16
```

## Monitoring

### Health Checks
- **Endpoint**: `GET /health`
- **Metrics**: `GET /metrics`
- **Response**: JSON with system status

### Log Files
- **Error logs**: `/var/log/tfmshop/error-YYYY-MM-DD.log`
- **Access logs**: `/var/log/tfmshop/access-YYYY-MM-DD.log`
- **Combined logs**: `/var/log/tfmshop/combined-YYYY-MM-DD.log`

### Monitoring Script
```bash
# Check system health
npm run monitor

# Start continuous monitoring
npm run monitor:start
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (min 32 characters)
- [ ] Configure CORS for your domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Set up log monitoring
- [ ] Configure backup strategy

## Backup Strategy

### Database Backup
```bash
# Daily backup script
pg_dump -h localhost -U tfmshop tfmshop > backup_$(date +%Y%m%d).sql

# Automated backup with cron
0 2 * * * /usr/local/bin/pg_dump -h localhost -U tfmshop tfmshop > /backups/tfmshop_$(date +\%Y\%m\%d).sql
```

### File Backup
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/

# Backup logs
tar -czf logs_backup_$(date +%Y%m%d).tar.gz logs/
```

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Check for memory leaks in logs
   - Restart PM2 processes: `pm2 restart all`
   - Increase server memory or optimize queries

2. **Database Connection Issues**
   - Check PostgreSQL service status
   - Verify connection parameters
   - Check connection pool settings

3. **Cache Issues**
   - Verify Redis service status
   - Check Redis memory usage
   - Clear cache if needed: `redis-cli FLUSHALL`

4. **Performance Issues**
   - Check slow query logs
   - Monitor cache hit rates
   - Review database indexes

### Log Analysis
```bash
# Check error logs
tail -f /var/log/tfmshop/error-$(date +%Y-%m-%d).log

# Check access patterns
grep "POST\|PUT\|DELETE" /var/log/tfmshop/access-$(date +%Y-%m-%d).log

# Monitor memory usage
grep "Memory usage" /var/log/tfmshop/combined-$(date +%Y-%m-%d).log
```

## Scaling Considerations

### Horizontal Scaling
- Use PM2 cluster mode
- Configure load balancer (Nginx/HAProxy)
- Implement session store (Redis)
- Use CDN for static assets

### Database Scaling
- Read replicas for read-heavy workloads
- Connection pooling optimization
- Query optimization and indexing
- Consider database sharding for large datasets

### Cache Scaling
- Redis cluster for high availability
- Cache warming strategies
- Distributed cache invalidation
- Monitor cache hit rates

## Support

For issues and questions:
1. Check logs for error details
2. Review monitoring metrics
3. Consult troubleshooting section
4. Contact development team with logs and metrics