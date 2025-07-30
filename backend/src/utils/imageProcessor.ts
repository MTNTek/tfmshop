import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Supported image formats
 */
export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif'
] as const;

/**
 * Image processing configuration
 */
export interface ImageProcessingConfig {
  maxFileSize: number; // in bytes
  maxWidth: number;
  maxHeight: number;
  quality: number; // 0-100
  allowedFormats: readonly string[];
}

/**
 * Default image processing configuration
 */
export const DEFAULT_IMAGE_CONFIG: ImageProcessingConfig = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 85,
  allowedFormats: SUPPORTED_IMAGE_FORMATS,
};

/**
 * Image processing result
 */
export interface ProcessedImage {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
  url: string;
}

/**
 * Image processor utility class
 */
export class ImageProcessor {
  private config: ImageProcessingConfig;
  private uploadDir: string;

  constructor(config: Partial<ImageProcessingConfig> = {}, uploadDir: string = 'uploads/images') {
    this.config = { ...DEFAULT_IMAGE_CONFIG, ...config };
    this.uploadDir = uploadDir;
    this.ensureUploadDirectory();
  }

  /**
   * Ensure upload directory exists
   */
  private ensureUploadDirectory(): void {
    const fullPath = path.resolve(this.uploadDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }

  /**
   * Generate unique filename
   */
  private generateFilename(originalName: string): string {
    const ext = path.extname(originalName).toLowerCase();
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${random}${ext}`;
  }

  /**
   * Validate image file
   */
  validateImage(file: Express.Multer.File): void {
    // Check file size
    if (file.size > this.config.maxFileSize) {
      throw new Error(`File size exceeds maximum allowed size of ${this.config.maxFileSize / (1024 * 1024)}MB`);
    }

    // Check if file is actually an image
    if (!file.mimetype.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Check file format
    if (!this.config.allowedFormats.includes(file.mimetype)) {
      throw new Error(`Unsupported file format. Allowed formats: ${this.config.allowedFormats.join(', ')}`);
    }
  }

  /**
   * Process and save image
   */
  async processImage(file: Express.Multer.File): Promise<ProcessedImage> {
    // Validate the image
    this.validateImage(file);

    // Generate unique filename
    const filename = this.generateFilename(file.originalname);
    const filePath = path.join(this.uploadDir, filename);

    try {
      // For now, we'll just save the file as-is
      // In a production environment, you might want to use sharp or similar for resizing
      fs.writeFileSync(filePath, file.buffer);

      const processedImage: ProcessedImage = {
        filename,
        originalName: file.originalname,
        path: filePath,
        size: file.size,
        mimetype: file.mimetype,
        url: `/api/images/${filename}`,
      };

      return processedImage;
    } catch (error) {
      throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process multiple images
   */
  async processImages(files: Express.Multer.File[]): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = [];
    
    for (const file of files) {
      try {
        const processed = await this.processImage(file);
        results.push(processed);
      } catch (error) {
        // Log error but continue processing other files
        console.error(`Failed to process image ${file.originalname}:`, error);
        throw error; // Re-throw to handle in controller
      }
    }

    return results;
  }

  /**
   * Delete image file
   */
  deleteImage(filename: string): void {
    const filePath = path.join(this.uploadDir, filename);
    
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete image ${filename}:`, error);
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete multiple images
   */
  deleteImages(filenames: string[]): void {
    for (const filename of filenames) {
      try {
        this.deleteImage(filename);
      } catch (error) {
        console.error(`Failed to delete image ${filename}:`, error);
        // Continue deleting other files even if one fails
      }
    }
  }

  /**
   * Get image file path
   */
  getImagePath(filename: string): string {
    return path.join(this.uploadDir, filename);
  }

  /**
   * Check if image exists
   */
  imageExists(filename: string): boolean {
    const filePath = this.getImagePath(filename);
    return fs.existsSync(filePath);
  }

  /**
   * Get image stats
   */
  getImageStats(filename: string): fs.Stats | null {
    try {
      const filePath = this.getImagePath(filename);
      return fs.statSync(filePath);
    } catch (error) {
      return null;
    }
  }
}

/**
 * Default image processor instance
 */
export const imageProcessor = new ImageProcessor();