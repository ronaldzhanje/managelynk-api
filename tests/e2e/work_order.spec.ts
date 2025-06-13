import { test, expect, APIRequestContext } from '@playwright/test';
import { deleteTestUser } from '../helpers/db';

test.describe('Work Order API', () => {
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'Test123!@#',
    firstName: 'Test',
    lastName: 'User'
  };
  let workOrderId: number;
  let authContext: APIRequestContext;

  test.beforeAll(async ({ playwright }) => {
    // Create a new API context that will be shared across all tests
    authContext = await playwright.request.newContext({
      baseURL: 'http://localhost:8080'
    });

    // Register user
    await authContext.post('/auth/register', {
      data: testUser
    });

    // Login - sets auth cookie
    const loginResponse = await authContext.post('/auth/login', {
      data: {
        email: testUser.email,
        password: testUser.password
      }
    });
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    expect(loginData).toEqual({ success: true });

    // Create test work order
    const workOrderResponse = await authContext.post('/work-orders', {
      multipart: {
        description: 'Test work order for chat',
        location: '10001',
        scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    });
    const workOrder = await workOrderResponse.json();
    workOrderId = workOrder.id;
  });

  test.afterAll(async () => {
    await authContext.dispose();
    await deleteTestUser(testUser.email);
  });

  test.describe('Work Order Messages', () => {
    let sessionId: string;
    let messageWorkOrderId: number;

    test.beforeEach(async () => {
      // Start work order to get sessionId
      const startResponse = await authContext.post('/work-orders/start', {
        data: {
          initialMessage: 'Test work order for messages'
        }
      });
      const data = await startResponse.json();
      sessionId = data.sessionId;
      messageWorkOrderId = data.workOrderId;
    });

    test('should send a text message successfully', async () => {
      const response = await authContext.post(`/work-orders/${messageWorkOrderId}/message`, {
        headers: {
          'x-session-id': sessionId
        },
        data: {
          type: 'text',
          content: 'When will the technician arrive?'
        }
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data.type).toBe('text');
      expect(data.content).toBe('When will the technician arrive?');
      expect(data).toHaveProperty('created_at');
    });

    test('should send an image message successfully', async () => {
      const response = await authContext.post(`/work-orders/${messageWorkOrderId}/message`, {
        headers: {
          'x-session-id': sessionId
        },
        data: {
          type: 'image',
          content: 'https://example.com/image.jpg'
        }
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.type).toBe('image');
      expect(data.content).toBe('https://example.com/image.jpg');
    });

    test('should reject empty message content', async () => {
      const response = await authContext.post(`/work-orders/${messageWorkOrderId}/message`, {
        headers: {
          'x-session-id': sessionId
        },
        data: {
          type: 'text',
          content: ''
        }
      });

      expect(response.status()).toBe(400);
      expect(response.statusText()).toBe('Bad Request');
      const error = await response.json();
      expect(error.message).toContain('content should not be empty');
    });

    test('should reject invalid message type', async () => {
      const response = await authContext.post(`/work-orders/${messageWorkOrderId}/message`, {
        headers: {
          'x-session-id': sessionId
        },
        data: {
          type: 'invalid_type',
          content: 'Test message'
        }
      });

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error.message).toContain('type must be one of the following values: text, ai_response, image');
    });

    test('should reject request without session ID', async () => {
      const response = await authContext.post(`/work-orders/${messageWorkOrderId}/message`, {
        data: {
          type: 'text',
          content: 'Test message'
        }
      });

      expect(response.status()).toBe(401);
    });

    test('should reject request with invalid session ID', async () => {
      const response = await authContext.post(`/work-orders/${messageWorkOrderId}/message`, {
        headers: {
          'x-session-id': 'invalid-session'
        },
        data: {
          type: 'text',
          content: 'Test message'
        }
      });

      expect(response.status()).toBe(404);
      expect(response.statusText()).toBe('Not Found');
    });

    test('should reject request without auth token', async ({ playwright }) => {
      const noAuthContext = await playwright.request.newContext();
      const response = await noAuthContext.post(`/work-orders/${messageWorkOrderId}/message`, {
        headers: {
          'x-session-id': sessionId
        },
        data: {
          type: 'text',
          content: 'Test message'
        }
      });

      expect(response.status()).toBe(401);
      await noAuthContext.dispose();
    });
  });

  test.describe('Start Work Order', () => {
    test('should start work order with chat', async () => {
      const response = await authContext.post('/work-orders/start', {
        data: {
          initialMessage: 'My AC is not working'
        }
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('sessionId');
      expect(data).toHaveProperty('workOrderId');
      expect(data).toHaveProperty('message');
      expect(data.message.message).toEqual({
        type: 'text',
        content: 'My AC is not working'
      });
      expect(typeof data.sessionId).toBe('string');
      expect(typeof data.workOrderId).toBe('number');
    });

    test('should fail to start work order without initial message', async () => {
      const response = await authContext.post('/work-orders/start', {
        data: {}
      });
      expect(response.status()).toBe(400);
    });

    test('should fail to start work order with empty initial message', async () => {
      const response = await authContext.post('/work-orders/start', {
        data: {
          initialMessage: ''
        }
      });
      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error.message).toContain('Initial message cannot be empty');
    });

    test('should fail to start work order with whitespace initial message', async () => {
      const response = await authContext.post('/work-orders/start', {
        data: {
          initialMessage: '   '
        }
      });
      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error.message).toContain('Initial message must contain at least 10 characters');
    });

    test('should fail to start work order without auth', async ({ playwright }) => {
      const noAuthContext = await playwright.request.newContext();
      const response = await noAuthContext.post('/work-orders/start', {
        data: {
          initialMessage: 'Test message'
        }
      });
      expect(response.status()).toBe(401);
      await noAuthContext.dispose();
    });
  });
});
