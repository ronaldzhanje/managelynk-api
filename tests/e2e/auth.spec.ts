import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'Test123!@#',
    firstName: 'Test',
    lastName: 'User'
  };

  test('should login with created account', async ({ request }) => {
    const registerResponse = await request.post('/auth/register', {
      data: testUser
    });

    expect(registerResponse.ok()).toBeTruthy();
    const registerData = await registerResponse.json();
    expect(registerData).toEqual({ success: true });

    const loginResponse = await request.post('/auth/login', {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });

    const loginData = await loginResponse.json();
    expect(loginData).toEqual({ success: true });
  });

  test('should fail login with wrong password', async ({ request }) => {
    const loginResponse = await request.post('/auth/login', {
      data: {
        email: testUser.email,
        password: 'wrongpassword'
      }
    });

    expect(loginResponse.ok()).toBeFalsy();
    expect(loginResponse.status()).toBe(401);
    const loginData = await loginResponse.json();
    expect(loginData).toEqual({
      message: 'Unauthorized',
      statusCode: 401
    });
  });
});
