import request from 'supertest';
import { app } from '../server';

describe('Base API Endpoints', () => {
  it('should return 200 OK from health check', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'OK');
  });

  it('should return 404 for non-existent routes', async () => {
    const res = await request(app).get('/api/v1/non-existent');
    expect(res.statusCode).toEqual(404);
  });
});
