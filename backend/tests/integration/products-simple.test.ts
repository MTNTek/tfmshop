import request from 'supertest';
import app from '../../src/app';

describe('Product API Simple Integration Tests', () => {
  describe('GET /api/products', () => {
    it('should respond to products endpoint', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/products/featured', () => {
    it('should respond to featured products endpoint', async () => {
      const response = await request(app)
        .get('/api/products/featured')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/products/search', () => {
    it('should return 400 when search term is missing', async () => {
      const response = await request(app)
        .get('/api/products/search')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_SEARCH_TERM');
    });

    it('should respond to search endpoint with query', async () => {
      const response = await request(app)
        .get('/api/products/search?q=test')
        .expect(200);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/products (Admin Only)', () => {
    it('should reject creation without authentication', async () => {
      const productData = {
        title: 'Test Product',
        description: 'Test description',
        slug: 'test-product',
        price: 99.99,
        stockQuantity: 10,
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/products/:id (Admin Only)', () => {
    it('should reject update without authentication', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app)
        .put(`/api/products/${fakeId}`)
        .send({ title: 'Updated' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/products/:id (Admin Only)', () => {
    it('should reject deletion without authentication', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app)
        .delete(`/api/products/${fakeId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/products/:id/stock (Admin Only)', () => {
    it('should reject stock update without authentication', async () => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000';
      const response = await request(app)
        .patch(`/api/products/${fakeId}/stock`)
        .send({ quantity: 50 })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return 400 for invalid product ID', async () => {
      const response = await request(app)
        .get('/api/products/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_PRODUCT_ID');
    });
  });

  describe('GET /api/products/slug/:slug', () => {
    it('should return 404 for non-existent slug', async () => {
      const response = await request(app)
        .get('/api/products/slug/non-existent-slug')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('PRODUCT_NOT_FOUND');
    });
  });
});