import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { AppDataSource } from '../../src/config/database';
import { User, UserRole } from '../../src/entities/User';
import { Product } from '../../src/entities/Product';
import { Category } from '../../src/entities/Category';
import { JwtUtils } from '../../src/utils/jwt';
import { PasswordUtils } from '../../src/utils/password';
import app from '../../src/app';

describe('Image Upload Integration Tests', () => {
  let adminUser: User;
  let testProduct: Product;
  let testCategory: Category;
  let adminToken: string;
  const testUploadDir = 'uploads/images';

  // Create a simple test image buffer
  const createTestImageBuffer = (format: 'jpeg' | 'png' = 'jpeg'): Buffer => {
    // This is a minimal valid JPEG header
    if (format === 'jpeg') {
      return Buffer.from([
        0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
        0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
        0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
        0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
        0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
        0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xD9
      ]);
    } else {
      // PNG header
      return Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
        0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
        0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
        0xAE, 0x42, 0x60, 0x82
      ]);
    }
  };

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    // Ensure upload directory exists
    if (!fs.existsSync(testUploadDir)) {
      fs.mkdirSync(testUploadDir, { recursive: true });
    }
  });

  beforeEach(async () => {
    // Clean up database
    await AppDataSource.getRepository(Product).delete({});
    await AppDataSource.getRepository(Category).delete({});
    await AppDataSource.getRepository(User).delete({});

    // Create admin user
    const userRepository = AppDataSource.getRepository(User);
    adminUser = userRepository.create({
      email: 'admin@example.com',
      password: await PasswordUtils.hashPassword('password123'),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
    });
    adminUser = await userRepository.save(adminUser);

    // Create test category
    const categoryRepository = AppDataSource.getRepository(Category);
    testCategory = categoryRepository.create({
      name: 'Test Category',
      description: 'Test category description',
      slug: 'test-category',
      isActive: true,
    });
    testCategory = await categoryRepository.save(testCategory);

    // Create test product
    const productRepository = AppDataSource.getRepository(Product);
    testProduct = productRepository.create({
      title: 'Test Product',
      description: 'Test product description',
      slug: 'test-product',
      price: 99.99,
      stockQuantity: 10,
      categoryId: testCategory.id,
      images: [],
      isActive: true,
      inStock: true,
    });
    testProduct = await productRepository.save(testProduct);

    // Generate admin token
    adminToken = JwtUtils.generateAccessToken(adminUser);
  });

  afterEach(async () => {
    // Clean up uploaded test files
    if (fs.existsSync(testUploadDir)) {
      const files = fs.readdirSync(testUploadDir);
      files.forEach(file => {
        const filePath = path.join(testUploadDir, file);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        }
      });
    }
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  describe('POST /api/products/:id/images', () => {
    it('should upload single image successfully', async () => {
      const imageBuffer = createTestImageBuffer('jpeg');

      const response = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', imageBuffer, 'test.jpg')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.uploadedImages).toHaveLength(1);
      expect(response.body.data.uploadedImages[0]).toHaveProperty('filename');
      expect(response.body.data.uploadedImages[0]).toHaveProperty('url');
      expect(response.body.data.product.images).toHaveLength(1);
    });

    it('should upload multiple images successfully', async () => {
      const imageBuffer1 = createTestImageBuffer('jpeg');
      const imageBuffer2 = createTestImageBuffer('png');

      const response = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', imageBuffer1, 'test1.jpg')
        .attach('images', imageBuffer2, 'test2.png')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.uploadedImages).toHaveLength(2);
      expect(response.body.data.product.images).toHaveLength(2);
    });

    it('should append to existing images', async () => {
      // First, add an image to the product
      await AppDataSource.getRepository(Product).update(testProduct.id, {
        images: ['/api/images/existing.jpg'],
      });

      const imageBuffer = createTestImageBuffer('jpeg');

      const response = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', imageBuffer, 'test.jpg')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.product.images).toHaveLength(2);
      expect(response.body.data.product.images[0]).toBe('/api/images/existing.jpg');
    });

    it('should require authentication', async () => {
      const imageBuffer = createTestImageBuffer('jpeg');

      const response = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .attach('images', imageBuffer, 'test.jpg')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });

    it('should require admin role', async () => {
      // Create regular user
      const userRepository = AppDataSource.getRepository(User);
      const regularUser = userRepository.create({
        email: 'user@example.com',
        password: await PasswordUtils.hashPassword('password123'),
        firstName: 'Regular',
        lastName: 'User',
        role: UserRole.CUSTOMER,
        isActive: true,
      });
      await userRepository.save(regularUser);

      const userToken = JwtUtils.generateAccessToken(regularUser);
      const imageBuffer = createTestImageBuffer('jpeg');

      const response = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${userToken}`)
        .attach('images', imageBuffer, 'test.jpg')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should return 404 for non-existent product', async () => {
      const imageBuffer = createTestImageBuffer('jpeg');

      const response = await request(app)
        .post('/api/products/123e4567-e89b-12d3-a456-426614174000/images')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', imageBuffer, 'test.jpg')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('should return 400 when no images provided', async () => {
      const response = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_IMAGES_PROVIDED');
    });

    it('should reject non-image files', async () => {
      const textBuffer = Buffer.from('This is not an image');

      const response = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', textBuffer, 'test.txt')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UPLOAD_ERROR');
    });
  });

  describe('DELETE /api/products/:id/images/:filename', () => {
    let uploadedFilename: string;

    beforeEach(async () => {
      // Upload an image first
      const imageBuffer = createTestImageBuffer('jpeg');
      const uploadResponse = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', imageBuffer, 'test.jpg');

      uploadedFilename = uploadResponse.body.data.uploadedImages[0].filename;
    });

    it('should delete image successfully', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}/images/${uploadedFilename}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toHaveLength(0);

      // Check that physical file is deleted
      const filePath = path.join(testUploadDir, uploadedFilename);
      expect(fs.existsSync(filePath)).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}/images/${uploadedFilename}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });

    it('should require admin role', async () => {
      // Create regular user
      const userRepository = AppDataSource.getRepository(User);
      const regularUser = userRepository.create({
        email: 'user@example.com',
        password: await PasswordUtils.hashPassword('password123'),
        firstName: 'Regular',
        lastName: 'User',
        role: UserRole.CUSTOMER,
        isActive: true,
      });
      await userRepository.save(regularUser);

      const userToken = JwtUtils.generateAccessToken(regularUser);

      const response = await request(app)
        .delete(`/api/products/${testProduct.id}/images/${uploadedFilename}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .delete(`/api/products/123e4567-e89b-12d3-a456-426614174000/images/${uploadedFilename}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('should return 404 for non-existent image', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProduct.id}/images/non-existent.jpg`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('IMAGE_NOT_FOUND');
    });
  });

  describe('PUT /api/products/:id/images/reorder', () => {
    let uploadedImages: string[];

    beforeEach(async () => {
      // Upload multiple images first
      const imageBuffer1 = createTestImageBuffer('jpeg');
      const imageBuffer2 = createTestImageBuffer('png');

      const uploadResponse = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', imageBuffer1, 'test1.jpg')
        .attach('images', imageBuffer2, 'test2.png');

      uploadedImages = uploadResponse.body.data.product.images;
    });

    it('should reorder images successfully', async () => {
      const reorderedImages = [uploadedImages[1], uploadedImages[0]]; // Reverse order

      const response = await request(app)
        .put(`/api/products/${testProduct.id}/images/reorder`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ imageOrder: reorderedImages })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toEqual(reorderedImages);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .put(`/api/products/${testProduct.id}/images/reorder`)
        .send({ imageOrder: uploadedImages })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_TOKEN');
    });

    it('should require admin role', async () => {
      // Create regular user
      const userRepository = AppDataSource.getRepository(User);
      const regularUser = userRepository.create({
        email: 'user@example.com',
        password: await PasswordUtils.hashPassword('password123'),
        firstName: 'Regular',
        lastName: 'User',
        role: UserRole.CUSTOMER,
        isActive: true,
      });
      await userRepository.save(regularUser);

      const userToken = JwtUtils.generateAccessToken(regularUser);

      const response = await request(app)
        .put(`/api/products/${testProduct.id}/images/reorder`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ imageOrder: uploadedImages })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .put('/api/products/123e4567-e89b-12d3-a456-426614174000/images/reorder')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ imageOrder: uploadedImages })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('should return 400 for invalid images in order', async () => {
      const invalidOrder = [...uploadedImages, '/api/images/non-existent.jpg'];

      const response = await request(app)
        .put(`/api/products/${testProduct.id}/images/reorder`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ imageOrder: invalidOrder })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_IMAGES');
    });

    it('should return 400 for missing image order', async () => {
      const response = await request(app)
        .put(`/api/products/${testProduct.id}/images/reorder`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/images/:filename', () => {
    let uploadedFilename: string;

    beforeEach(async () => {
      // Upload an image first
      const imageBuffer = createTestImageBuffer('jpeg');
      const uploadResponse = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', imageBuffer, 'test.jpg');

      uploadedFilename = uploadResponse.body.data.uploadedImages[0].filename;
    });

    it('should serve image successfully', async () => {
      const response = await request(app)
        .get(`/api/images/${uploadedFilename}`)
        .expect(200);

      expect(response.headers['content-type']).toBe('image/jpeg');
      expect(response.headers['cache-control']).toContain('max-age=31536000');
      expect(response.body).toBeDefined();
    });

    it('should return 404 for non-existent image', async () => {
      const response = await request(app)
        .get('/api/images/non-existent.jpg')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('IMAGE_NOT_FOUND');
    });

    it('should return 400 for invalid filename', async () => {
      const response = await request(app)
        .get('/api/images/../../../etc/passwd')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_FILENAME');
    });

    it('should return 304 for cached requests', async () => {
      // First request to get ETag
      const firstResponse = await request(app)
        .get(`/api/images/${uploadedFilename}`)
        .expect(200);

      const etag = firstResponse.headers['etag'];

      // Second request with If-None-Match header
      const secondResponse = await request(app)
        .get(`/api/images/${uploadedFilename}`)
        .set('If-None-Match', etag)
        .expect(304);

      expect(secondResponse.body).toEqual({});
    });
  });

  describe('GET /api/images/:filename/info', () => {
    let uploadedFilename: string;

    beforeEach(async () => {
      // Upload an image first
      const imageBuffer = createTestImageBuffer('jpeg');
      const uploadResponse = await request(app)
        .post(`/api/products/${testProduct.id}/images`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('images', imageBuffer, 'test.jpg');

      uploadedFilename = uploadResponse.body.data.uploadedImages[0].filename;
    });

    it('should return image metadata', async () => {
      const response = await request(app)
        .get(`/api/images/${uploadedFilename}/info`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('filename', uploadedFilename);
      expect(response.body.data).toHaveProperty('size');
      expect(response.body.data).toHaveProperty('mimeType', 'image/jpeg');
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('modifiedAt');
      expect(response.body.data).toHaveProperty('url');
    });

    it('should return 404 for non-existent image', async () => {
      const response = await request(app)
        .get('/api/images/non-existent.jpg/info')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('IMAGE_NOT_FOUND');
    });
  });
});