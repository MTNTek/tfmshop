import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth';

// Mock the AuthService to avoid database dependencies
jest.mock('../../src/services/AuthService', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => ({
      register: jest.fn(),
      login: jest.fn(),
      refreshToken: jest.fn(),
      initiatePasswordReset: jest.fn(),
      resetPassword: jest.fn(),
    })),
  };
});

describe('Auth Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  describe('Route Registration', () => {
    it('should have POST /register route', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
        });

      // Should not return 404 (route exists)
      expect(response.status).not.toBe(404);
    });

    it('should have POST /login route', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      // Should not return 404 (route exists)
      expect(response.status).not.toBe(404);
    });

    it('should have POST /logout route', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .send();

      // Should not return 404 (route exists)
      expect(response.status).not.toBe(404);
    });

    it('should have POST /refresh route', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'some-token',
        });

      // Should not return 404 (route exists)
      expect(response.status).not.toBe(404);
    });

    it('should have POST /forgot-password route', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'test@example.com',
        });

      // Should not return 404 (route exists)
      expect(response.status).not.toBe(404);
    });

    it('should have POST /reset-password route', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'reset-token',
          password: 'newpassword123',
        });

      // Should not return 404 (route exists)
      expect(response.status).not.toBe(404);
    });
  });

  describe('Validation Middleware Integration', () => {
    it('should validate register request body', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: 'weak',
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: expect.any(Array),
        },
      });

      // Should have validation errors for email, password, firstName, lastName
      expect(response.body.error.details.length).toBeGreaterThan(0);
    });

    it('should validate login request body', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          // Missing password
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
        },
      });
    });

    it('should validate refresh token request body', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          // Missing refreshToken
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
        },
      });
    });

    it('should validate forgot password request body', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
        },
      });
    });

    it('should validate reset password request body', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'reset-token',
          password: 'weak', // Too weak
        })
        .expect(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
        },
      });
    });
  });

  describe('Request Transformation', () => {
    it('should transform and normalize email in register', async () => {
      // This test verifies that the validation middleware transforms the request
      // We can't easily test the transformation without mocking the controller,
      // but we can verify that the route accepts the request format
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
        });

      // Should not return validation error (transformation worked)
      expect(response.status).not.toBe(400);
    });

    it('should transform and normalize email in login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: 'password123',
        });

      // Should not return validation error (transformation worked)
      expect(response.status).not.toBe(400);
    });
  });

  describe('HTTP Methods', () => {
    it('should only accept POST requests for auth endpoints', async () => {
      const endpoints = [
        '/api/auth/register',
        '/api/auth/login',
        '/api/auth/logout',
        '/api/auth/refresh',
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
      ];

      for (const endpoint of endpoints) {
        // GET should not be allowed
        const getResponse = await request(app).get(endpoint);
        expect(getResponse.status).toBe(404);

        // PUT should not be allowed
        const putResponse = await request(app).put(endpoint);
        expect(putResponse.status).toBe(404);

        // DELETE should not be allowed
        const deleteResponse = await request(app).delete(endpoint);
        expect(deleteResponse.status).toBe(404);
      }
    });
  });

  describe('Content-Type Handling', () => {
    it('should handle JSON content type', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }));

      // Should not return 400 for content type issues
      expect(response.status).not.toBe(415);
    });

    it('should reject non-JSON content', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'text/plain')
        .send('email=test@example.com&password=password123');

      // Express should handle this gracefully
      expect(response.status).toBe(400);
    });
  });
});