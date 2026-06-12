import { test } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';

// The app verifies tokens with JWT_SECRET; set a value before importing it.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
const { default: app } = await import('../src/app.js');

// 1. A public endpoint returns the expected data.
test('GET /api/parks returns the four parks', async () => {
  const res = await request(app).get('/api/parks');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.parks.length, 4);
});

// 2. A protected endpoint rejects requests with no token.
test('GET /api/plans without a token returns 401', async () => {
  const res = await request(app).get('/api/plans');
  assert.strictEqual(res.status, 401);
  assert.ok(res.body.error);
});
