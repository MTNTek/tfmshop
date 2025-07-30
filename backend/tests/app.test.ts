import request from 'supertest';
import app from '../src/app';

describe('App', () => {
  it('should respond to health check', async () => {
    const response = await request(app)
      .get('/health');

    // Health check should respond with either 200 (OK) or 503 (DEGRADED) depending on database availability
    expect([200, 503]).toContain(response.status);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('environment');
    expect(response.body).toHaveProperty('database');
    
    // Status should be OK, DEGRADED, or ERROR
    expect(['OK', 'DEGRADED', 'ERROR']).toContain(response.body.status);
  });

  it('should return 404 for unknown routes', async () => {
    const response = await request(app)
      .get('/unknown-route')
      .expect(404);

    expect(response.body).toHaveProperty('success', false);
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
  });
});