import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Middleware to validate request body against Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate and transform request body
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Request body validation failed', {
          path: req.originalUrl,
          method: req.method,
          errors: error.errors,
        });

        const validationError = new ValidationError('Request body validation failed');
        (validationError as any).details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        next(validationError);
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware to validate request query parameters against Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate and transform query parameters
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Query parameter validation failed', {
          path: req.originalUrl,
          method: req.method,
          query: req.query,
          errors: error.errors,
        });

        const validationError = new ValidationError('Query parameter validation failed');
        (validationError as any).details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        next(validationError);
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware to validate request parameters against Zod schema
 * @param schema - Zod schema to validate against
 * @returns Express middleware function
 */
export const validateParams = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate and transform request parameters
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Path parameter validation failed', {
          path: req.originalUrl,
          method: req.method,
          params: req.params,
          errors: error.errors,
        });

        const validationError = new ValidationError('Path parameter validation failed');
        (validationError as any).details = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        next(validationError);
      } else {
        next(error);
      }
    }
  };
};

/**
 * Middleware to validate file uploads
 */
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedTypes?: string[];
  required?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = [], required = false } = options;

    try {
      const files = req.files as any;
      
      if (required && (!files || Object.keys(files).length === 0)) {
        throw new ValidationError('File upload is required');
      }

      if (files) {
        for (const fieldName in files) {
          const fileArray = Array.isArray(files[fieldName]) ? files[fieldName] : [files[fieldName]];
          
          for (const file of fileArray) {
            // Check file size
            if (file.size > maxSize) {
              throw new ValidationError(`File ${file.name} exceeds maximum size of ${maxSize} bytes`);
            }

            // Check file type
            if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
              throw new ValidationError(`File type ${file.mimetype} is not allowed`);
            }
          }
        }
      }

      next();
    } catch (error) {
      logger.warn('File upload validation failed', {
        path: req.originalUrl,
        method: req.method,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      next(error);
    }
  };
};

/**
 * Sanitize input middleware
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  // Sanitize params
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }

  next();
};

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const sanitized: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
  }

  return sanitized;
}

/**
 * Sanitize string input
 */
function sanitizeString(input: any): any {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove potential XSS patterns
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}