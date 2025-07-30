import fs from 'fs';
import path from 'path';
import { ImageProcessor, SUPPORTED_IMAGE_FORMATS } from '../../src/utils/imageProcessor';

describe('ImageProcessor', () => {
  let imageProcessor: ImageProcessor;
  const testUploadDir = 'test-uploads';

  beforeEach(() => {
    imageProcessor = new ImageProcessor({}, testUploadDir);
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testUploadDir)) {
      const files = fs.readdirSync(testUploadDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testUploadDir, file));
      });
      fs.rmdirSync(testUploadDir);
    }
  });

  describe('validateImage', () => {
    it('should validate a valid image file', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from('fake image data'),
        destination: '',
        filename: '',
        path: '',
        stream: {} as any,
      };

      expect(() => imageProcessor.validateImage(mockFile)).not.toThrow();
    });

    it('should throw error for file size exceeding limit', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024, // 10MB (exceeds 5MB limit)
        buffer: Buffer.from('fake image data'),
        destination: '',
        filename: '',
        path: '',
        stream: {} as any,
      };

      expect(() => imageProcessor.validateImage(mockFile))
        .toThrow('File size exceeds maximum allowed size');
    });

    it('should throw error for unsupported file format', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.bmp',
        encoding: '7bit',
        mimetype: 'image/bmp', // Unsupported image format
        size: 1024,
        buffer: Buffer.from('fake image data'),
        destination: '',
        filename: '',
        path: '',
        stream: {} as any,
      };

      expect(() => imageProcessor.validateImage(mockFile))
        .toThrow('Unsupported file format');
    });

    it('should throw error for non-image file', () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('fake pdf data'),
        destination: '',
        filename: '',
        path: '',
        stream: {} as any,
      };

      expect(() => imageProcessor.validateImage(mockFile))
        .toThrow('File must be an image');
    });
  });

  describe('processImage', () => {
    it('should process and save a valid image', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake image data'),
        destination: '',
        filename: '',
        path: '',
        stream: {} as any,
      };

      const result = await imageProcessor.processImage(mockFile);

      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('originalName', 'test.jpg');
      expect(result).toHaveProperty('size', 1024);
      expect(result).toHaveProperty('mimetype', 'image/jpeg');
      expect(result).toHaveProperty('url');
      expect(result.url).toMatch(/^\/api\/images\/.+$/);

      // Check if file was actually created
      expect(fs.existsSync(result.path)).toBe(true);
    });

    it('should generate unique filenames', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake image data'),
        destination: '',
        filename: '',
        path: '',
        stream: {} as any,
      };

      const result1 = await imageProcessor.processImage(mockFile);
      const result2 = await imageProcessor.processImage(mockFile);

      expect(result1.filename).not.toBe(result2.filename);
    });
  });

  describe('processImages', () => {
    it('should process multiple images', async () => {
      const mockFiles: Express.Multer.File[] = [
        {
          fieldname: 'images',
          originalname: 'test1.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          size: 1024,
          buffer: Buffer.from('fake image data 1'),
          destination: '',
          filename: '',
          path: '',
          stream: {} as any,
        },
        {
          fieldname: 'images',
          originalname: 'test2.png',
          encoding: '7bit',
          mimetype: 'image/png',
          size: 2048,
          buffer: Buffer.from('fake image data 2'),
          destination: '',
          filename: '',
          path: '',
          stream: {} as any,
        },
      ];

      const results = await imageProcessor.processImages(mockFiles);

      expect(results).toHaveLength(2);
      expect(results[0].originalName).toBe('test1.jpg');
      expect(results[1].originalName).toBe('test2.png');

      // Check if files were actually created
      results.forEach(result => {
        expect(fs.existsSync(result.path)).toBe(true);
      });
    });

    it('should throw error if any image processing fails', async () => {
      const mockFiles: Express.Multer.File[] = [
        {
          fieldname: 'images',
          originalname: 'test1.jpg',
          encoding: '7bit',
          mimetype: 'image/jpeg',
          size: 1024,
          buffer: Buffer.from('fake image data 1'),
          destination: '',
          filename: '',
          path: '',
          stream: {} as any,
        },
        {
          fieldname: 'images',
          originalname: 'test2.txt',
          encoding: '7bit',
          mimetype: 'text/plain', // Non-image format
          size: 2048,
          buffer: Buffer.from('fake text data'),
          destination: '',
          filename: '',
          path: '',
          stream: {} as any,
        },
      ];

      await expect(imageProcessor.processImages(mockFiles))
        .rejects.toThrow('File must be an image');
    });
  });

  describe('deleteImage', () => {
    it('should delete an existing image', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake image data'),
        destination: '',
        filename: '',
        path: '',
        stream: {} as any,
      };

      const result = await imageProcessor.processImage(mockFile);
      expect(fs.existsSync(result.path)).toBe(true);

      imageProcessor.deleteImage(result.filename);
      expect(fs.existsSync(result.path)).toBe(false);
    });

    it('should not throw error when deleting non-existent image', () => {
      expect(() => imageProcessor.deleteImage('non-existent.jpg')).not.toThrow();
    });
  });

  describe('imageExists', () => {
    it('should return true for existing image', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake image data'),
        destination: '',
        filename: '',
        path: '',
        stream: {} as any,
      };

      const result = await imageProcessor.processImage(mockFile);
      expect(imageProcessor.imageExists(result.filename)).toBe(true);
    });

    it('should return false for non-existent image', () => {
      expect(imageProcessor.imageExists('non-existent.jpg')).toBe(false);
    });
  });

  describe('getImageStats', () => {
    it('should return stats for existing image', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'test.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from('fake image data'),
        destination: '',
        filename: '',
        path: '',
        stream: {} as any,
      };

      const result = await imageProcessor.processImage(mockFile);
      const stats = imageProcessor.getImageStats(result.filename);

      expect(stats).not.toBeNull();
      expect(stats?.size).toBeGreaterThan(0);
      expect(stats?.isFile()).toBe(true);
    });

    it('should return null for non-existent image', () => {
      const stats = imageProcessor.getImageStats('non-existent.jpg');
      expect(stats).toBeNull();
    });
  });
});

describe('SUPPORTED_IMAGE_FORMATS', () => {
  it('should contain expected image formats', () => {
    expect(SUPPORTED_IMAGE_FORMATS).toContain('image/jpeg');
    expect(SUPPORTED_IMAGE_FORMATS).toContain('image/jpg');
    expect(SUPPORTED_IMAGE_FORMATS).toContain('image/png');
    expect(SUPPORTED_IMAGE_FORMATS).toContain('image/webp');
    expect(SUPPORTED_IMAGE_FORMATS).toContain('image/gif');
  });
});