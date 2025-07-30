import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Production flags
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  
  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'tfmshop',
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  
  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },
  
  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@tfmshop.com',
  },
  
  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'tfmshop',
  },
  
  // Performance
  performance: {
    enableCaching: process.env.ENABLE_CACHING !== 'false',
    enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
    enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false',
    cacheDefaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'),
    rateLimit: {
      general: parseInt(process.env.RATE_LIMIT_GENERAL || '1000'), // requests per 15 minutes
      auth: parseInt(process.env.RATE_LIMIT_AUTH || '10'), // auth requests per 15 minutes
      api: parseInt(process.env.RATE_LIMIT_API || '500'), // API requests per 15 minutes
      upload: parseInt(process.env.RATE_LIMIT_UPLOAD || '20'), // upload requests per hour
      search: parseInt(process.env.RATE_LIMIT_SEARCH || '100'), // search requests per 5 minutes
      admin: parseInt(process.env.RATE_LIMIT_ADMIN || '200'), // admin requests per 15 minutes
    },
  },
  
  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableFileLogging: process.env.ENABLE_FILE_LOGGING === 'true',
    logDirectory: process.env.LOG_DIRECTORY || './logs',
  },
};