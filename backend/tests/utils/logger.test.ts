import { Logger, LogLevel, logger } from '../../src/utils/logger';
import { ValidationError, InternalServerError } from '../../src/utils/errors';

// Mock console methods
const originalConsoleLog = console.log;
const mockConsoleLog = jest.fn();

describe('Logger', () => {
  beforeEach(() => {
    console.log = mockConsoleLog;
    mockConsoleLog.mockClear();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const logger1 = Logger.getInstance();
      const logger2 = Logger.getInstance();

      expect(logger1).toBe(logger2);
      expect(logger1).toBe(logger);
    });
  });

  describe('error', () => {
    it('should log error with message only', () => {
      logger.error('Test error message');

      expect(mockConsoleLog).toHaveBeenCalled();
      const logCall = mockConsoleLog.mock.calls[0][0];
      
      if (typeof logCall === 'string') {
        // Development mode - pretty print
        expect(logCall).toContain('ERROR: Test error message');
      } else {
        // Production mode - JSON
        const logEntry = JSON.parse(logCall);
        expect(logEntry.level).toBe(LogLevel.ERROR);
        expect(logEntry.message).toBe('Test error message');
        expect(logEntry.timestamp).toBeDefined();
      }
    });

    it('should log error with Error object', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);

      expect(mockConsoleLog).toHaveBeenCalled();
      const logCall = mockConsoleLog.mock.calls[0][0];
      
      if (typeof logCall === 'string') {
        // Development mode
        expect(logCall).toContain('ERROR: Error occurred');
      } else {
        // Production mode
        const logEntry = JSON.parse(logCall);
        expect(logEntry.level).toBe(LogLevel.ERROR);
        expect(logEntry.message).toBe('Error occurred');
        expect(logEntry.error.name).toBe('Error');
        expect(logEntry.error.message).toBe('Test error');
      }
    });

    it('should log error with AppError', () => {
      const error = new ValidationError('Validation failed');
      logger.error('Validation error', error);

      expect(mockConsoleLog).toHaveBeenCalled();
      const logCall = mockConsoleLog.mock.calls[0][0];
      
      if (typeof logCall === 'string') {
        // Development mode
        expect(logCall).toContain('ERROR: Validation error');
      } else {
        // Production mode
        const logEntry = JSON.parse(logCall);
        expect(logEntry.error.statusCode).toBe(400);
        expect(logEntry.error.errorCode).toBe('VALIDATION_ERROR');
      }
    });

    it('should log error with context', () => {
      const context = { userId: '123', action: 'login' };
      logger.error('Login failed', undefined, context);

      expect(mockConsoleLog).toHaveBeenCalled();
      const logCall = mockConsoleLog.mock.calls[0][0];
      
      if (typeof logCall === 'string') {
        // Development mode
        expect(logCall).toContain('ERROR: Login failed');
      } else {
        // Production mode
        const logEntry = JSON.parse(logCall);
        expect(logEntry.context).toEqual(context);
      }
    });

    it('should sanitize sensitive context data', () => {
      const context = { 
        userId: '123', 
        password: 'secret123',
        token: 'jwt-token',
        normalField: 'value'
      };
      logger.error('Error with sensitive data', undefined, context);

      expect(mockConsoleLog).toHaveBeenCalled();
      const logCall = mockConsoleLog.mock.calls[0][0];
      
      if (typeof logCall === 'string') {
        // Development mode
        expect(logCall).toContain('ERROR: Error with sensitive data');
      } else {
        // Production mode
        const logEntry = JSON.parse(logCall);
        expect(logEntry.context.userId).toBe('123');
        expect(logEntry.context.password).toBe('[REDACTED]');
        expect(logEntry.context.token).toBe('[REDACTED]');
        expect(logEntry.context.normalField).toBe('value');
      }
    });

    it('should log error with request information', () => {
      const mockRequest = {
        method: 'POST',
        originalUrl: '/api/users',
        get: jest.fn().mockReturnValue('Mozilla/5.0'),
        ip: '127.0.0.1',
        user: { id: '123' },
      };

      logger.error('Request error', undefined, undefined, mockRequest);

      expect(mockConsoleLog).toHaveBeenCalled();
      const logCall = mockConsoleLog.mock.calls[0][0];
      
      if (typeof logCall === 'string') {
        // Development mode
        expect(logCall).toContain('ERROR: Request error');
      } else {
        // Production mode
        const logEntry = JSON.parse(logCall);
        expect(logEntry.request.method).toBe('POST');
        expect(logEntry.request.url).toBe('/api/users');
        expect(logEntry.request.ip).toBe('127.0.0.1');
        expect(logEntry.request.userId).toBe('123');
      }
    });
  });

  describe('warn', () => {
    it('should log warning message', () => {
      logger.warn('Warning message');

      expect(mockConsoleLog).toHaveBeenCalled();
      const logCall = mockConsoleLog.mock.calls[0][0];
      
      if (typeof logCall === 'string') {
        expect(logCall).toContain('WARN: Warning message');
      } else {
        const logEntry = JSON.parse(logCall);
        expect(logEntry.level).toBe(LogLevel.WARN);
        expect(logEntry.message).toBe('Warning message');
      }
    });
  });

  describe('info', () => {
    it('should log info message', () => {
      logger.info('Info message');

      expect(mockConsoleLog).toHaveBeenCalled();
      const logCall = mockConsoleLog.mock.calls[0][0];
      
      if (typeof logCall === 'string') {
        expect(logCall).toContain('INFO: Info message');
      } else {
        const logEntry = JSON.parse(logCall);
        expect(logEntry.level).toBe(LogLevel.INFO);
        expect(logEntry.message).toBe('Info message');
      }
    });
  });

  describe('security', () => {
    it('should log security event', () => {
      logger.security('Suspicious activity detected');

      expect(mockConsoleLog).toHaveBeenCalled();
      const logCall = mockConsoleLog.mock.calls[0][0];
      
      if (typeof logCall === 'string') {
        expect(logCall).toContain('[SECURITY] Suspicious activity detected');
      } else {
        const logEntry = JSON.parse(logCall);
        expect(logEntry.level).toBe(LogLevel.WARN);
        expect(logEntry.message).toBe('[SECURITY] Suspicious activity detected');
      }
    });
  });

  describe('auth', () => {
    it('should log authentication event', () => {
      logger.auth('User logged in', '123');

      expect(mockConsoleLog).toHaveBeenCalled();
      const logCall = mockConsoleLog.mock.calls[0][0];
      
      if (typeof logCall === 'string') {
        expect(logCall).toContain('[AUTH] User logged in');
      } else {
        const logEntry = JSON.parse(logCall);
        expect(logEntry.level).toBe(LogLevel.INFO);
        expect(logEntry.message).toBe('[AUTH] User logged in');
        expect(logEntry.context.userId).toBe('123');
      }
    });
  });

  describe('database', () => {
    it('should log database operation', () => {
      logger.database('Query executed', 'SELECT');

      expect(mockConsoleLog).toHaveBeenCalled();
      const logCall = mockConsoleLog.mock.calls[0][0];
      
      if (typeof logCall === 'string') {
        expect(logCall).toContain('[DATABASE] Query executed');
      } else {
        const logEntry = JSON.parse(logCall);
        expect(logEntry.level).toBe(LogLevel.DEBUG);
        expect(logEntry.message).toBe('[DATABASE] Query executed');
        expect(logEntry.context.operation).toBe('SELECT');
      }
    });
  });

  describe('URL sanitization', () => {
    it('should sanitize sensitive query parameters', () => {
      const mockRequest = {
        method: 'GET',
        originalUrl: '/api/users?token=secret123&name=john',
        get: jest.fn(),
        ip: '127.0.0.1',
      };

      logger.error('Request error', undefined, undefined, mockRequest);

      expect(mockConsoleLog).toHaveBeenCalled();
      const logCall = mockConsoleLog.mock.calls[0][0];
      
      if (typeof logCall === 'string') {
        // Development mode
        expect(logCall).toContain('ERROR: Request error');
      } else {
        // Production mode
        const logEntry = JSON.parse(logCall);
        expect(logEntry.request.url).toContain('token=[REDACTED]');
        expect(logEntry.request.url).toContain('name=john');
      }
    });
  });

  describe('Client IP extraction', () => {
    it('should extract IP from various headers', () => {
      const mockRequest = {
        method: 'GET',
        originalUrl: '/api/test',
        get: jest.fn(),
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
          'x-real-ip': '192.168.1.2',
        },
      };

      logger.error('Request error', undefined, undefined, mockRequest);

      expect(mockConsoleLog).toHaveBeenCalled();
      const logCall = mockConsoleLog.mock.calls[0][0];
      
      if (typeof logCall === 'string') {
        // Development mode
        expect(logCall).toContain('ERROR: Request error');
      } else {
        // Production mode
        const logEntry = JSON.parse(logCall);
        expect(logEntry.request.ip).toBe('192.168.1.1');
      }
    });
  });
});