import multer from 'multer';
import { Request } from 'express';
import { imageProcessor, SUPPORTED_IMAGE_FORMATS } from '../utils/imageProcessor';

/**
 * Multer configuration for image uploads
 */
const storage = multer.memoryStorage();

/**
 * File filter for image uploads
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check if file is an image
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'));
  }

  // Check if format is supported
  if (!SUPPORTED_IMAGE_FORMATS.includes(file.mimetype as any)) {
    return cb(new Error(`Unsupported image format. Allowed formats: ${SUPPORTED_IMAGE_FORMATS.join(', ')}`));
  }

  cb(null, true);
};

/**
 * Multer configuration
 */
const multerConfig: multer.Options = {
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 10, // Maximum 10 files per request
  },
};

/**
 * Multer instance
 */
export const upload = multer(multerConfig);

/**
 * Middleware for single image upload
 */
export const uploadSingle = (fieldName: string = 'image') => {
  return upload.single(fieldName);
};

/**
 * Middleware for multiple image uploads
 */
export const uploadMultiple = (fieldName: string = 'images', maxCount: number = 10) => {
  return upload.array(fieldName, maxCount);
};

/**
 * Middleware for mixed file uploads (multiple fields)
 */
export const uploadFields = (fields: multer.Field[]) => {
  return upload.fields(fields);
};

/**
 * Error handler for multer errors
 */
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    let statusCode = 400;

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size too large. Maximum size is 5MB';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum is 10 files per request';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields';
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts';
        break;
      default:
        message = error.message || 'File upload error';
    }

    return res.status(statusCode).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message,
        details: error.code,
      },
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }

  // Handle other upload-related errors
  if (error.message && error.message.includes('image')) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE',
        message: error.message,
      },
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }

  // Pass other errors to the next error handler
  next(error);
};