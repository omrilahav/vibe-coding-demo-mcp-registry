import request from 'supertest';

// Define the base URL of your running server
const API_URL = 'http://localhost:3001'; // Updated port to 3001 based on .env

describe('API Endpoint Tests', () => {
  // Test the /api/health endpoint
  it('GET /api/health should return status ok', async () => {
    const response = await request(API_URL)
      .get('/api/health')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      message: 'MCP Registry API is running'
    });
  });

  // Add more simple API tests here if needed
  // e.g., testing GET /api/categories or GET /api/stats
}); 