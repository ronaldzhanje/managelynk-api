import { test, expect, APIRequestContext } from '@playwright/test';
import { deleteTestUser } from '../helpers/db';
import { readFileSync } from 'fs';
import { join } from 'path';

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
    // Force serial execution to prevent race conditions
    test.describe.configure({ mode: 'serial' });
    
    let messageWorkOrderId: number;
    let messageIds: number[] = [];

    test.beforeEach(async () => {
      // Reset message IDs for this test
      messageIds = [];

      // Start work order with initial message
      const startResponse = await authContext.post('/work-orders/start', {
        data: {
          initialMessage: 'Test work order for messages',
        }
      });
      const data = await startResponse.json();
      messageWorkOrderId = data.workOrderId;
      messageIds.push(data.message.id); // Track initial message

      // Add a few test messages
      const msg1Response = await authContext.post(`/work-orders/${messageWorkOrderId}/message`, {
        data: {
          type: 'text',
          content: 'Message 1'
        }
      });
      const msg1Data = await msg1Response.json();
      messageIds.push(msg1Data.id);

      const msg2Response = await authContext.post(`/work-orders/${messageWorkOrderId}/message`, {
        data: {
          type: 'text',
          content: 'Message 2'
        }
      });
      const msg2Data = await msg2Response.json();
      messageIds.push(msg2Data.id);

      // Wait for DB operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    test.afterEach(async () => {
      // Clean up all messages created during the test
      // for (const id of messageIds) {
      //   try {
      //     await authContext.delete(`/work-orders/${messageWorkOrderId}/message/${id}`);
      //   } catch (e) {
      //     console.warn(`Failed to delete message ${id}:`, e);
      //   }
      // }
    });

    test('should send a text message successfully', async () => {
      const response = await authContext.post(`/work-orders/${messageWorkOrderId}/message`, {
        data: {
          type: 'text',
          content: 'Test message'
        }
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      messageIds.push(data.id); // Track for cleanup
      expect(data).toHaveProperty('type', 'text');
      expect(data).toHaveProperty('content', 'Test message');
    });

    test('should reject invalid message type', async () => {
      const response = await authContext.post(`/work-orders/${messageWorkOrderId}/message`, {
        data: {
          type: 'invalid_type',
          content: 'Test message'
        }
      });

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error.message).toContain('type must be one of the following values: text, ai_response, image');
    });

    test('should reject request without auth token', async ({ playwright }) => {
      const noAuthContext = await playwright.request.newContext();
      const response = await noAuthContext.post(`/work-orders/${messageWorkOrderId}/message`, {
        data: {
          type: 'text',
          content: 'Test message'
        }
      });

      expect(response.status()).toBe(401);
      await noAuthContext.dispose();
    });

    test('should get chat history successfully', async () => {
      // Wait for any previous operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await authContext.get(`/work-orders/${messageWorkOrderId}/messages`);
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data.messages)).toBe(true);
      
      // Verify we can find all our created messages
      const knownMessageIds = new Set(messageIds);
      const foundMessages = data.messages.filter(m => knownMessageIds.has(m.id));
      expect(foundMessages.length).toBe(messageIds.length);
      
      // Verify message structure
      const message = data.messages[0];
      expect(message).toHaveProperty('id');
      expect(message).toHaveProperty('content');
      expect(message).toHaveProperty('created_at');
      expect(message).toHaveProperty('type');
    });

    test('should paginate chat history', async () => {
      const page1Response = await authContext.get(`/work-orders/${messageWorkOrderId}/messages?page=1&limit=2`);
      const page2Response = await authContext.get(`/work-orders/${messageWorkOrderId}/messages?page=2&limit=2`);
      
      expect(page1Response.status()).toBe(200);
      expect(page2Response.status()).toBe(200);
      
      const page1Data = await page1Response.json();
      const page2Data = await page2Response.json();
      
      expect(Array.isArray(page1Data.messages)).toBe(true);
      expect(Array.isArray(page2Data.messages)).toBe(true);
      expect(page1Data.messages.length).toBe(2);
      expect(page2Data.messages.length).toBeGreaterThanOrEqual(1);
      
      // Verify different messages on different pages
      expect(page1Data.messages[0].id).not.toBe(page2Data.messages[0].id);
    });

    test('should handle invalid work order ID', async () => {
      const response = await authContext.get('/work-orders/999999/messages');
      expect(response.status()).toBe(404);
    });

    test('should reject chat history access without auth token', async ({ playwright }) => {
      const noAuthContext = await playwright.request.newContext();
      const response = await noAuthContext.get(`/work-orders/${messageWorkOrderId}/messages`);
      
      expect(response.status()).toBe(401);
      await noAuthContext.dispose();
    });

    test('should reject chat history access for unauthorized user', async ({ playwright }) => {
      // Create and login as different user
      const otherUserContext = await playwright.request.newContext();
      
      // Create the other test user first
      const otherUser = {
        email: 'other@example.com',
        password: 'password123',
        firstName: 'Other',
        lastName: 'User'
      };
      
      await otherUserContext.post('/auth/register', {
        data: otherUser
      });

      const loginResponse = await otherUserContext.post('/auth/login', {
        data: {
          email: otherUser.email,
          password: otherUser.password
        }
      });
      
      expect(loginResponse.status()).toBe(201);
      const { access_token } = await loginResponse.json();
      
      const response = await otherUserContext.get(`/work-orders/${messageWorkOrderId}/messages`, {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      });
      
      expect(response.status()).toBe(403);
      await otherUserContext.dispose();
      await deleteTestUser(otherUser.email); // Clean up the other test user
    });

    const createFormData = ({ files = [], content = '', type = 'image' } = {}) => {
      const form = new FormData();
      form.append('type', type);
      if (content) form.append('content', content);
      files.forEach(file => {
        const buffer = readFileSync(join(__dirname, '../fixtures', file));
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        form.append('files', blob, file);
      });
      return form;
    };

    test('should send an image message successfully', async () => {
      const formData = createFormData({
        files: ['IMG_0001.jpeg'],
        content: 'Test image caption'
      });

      const response = await authContext.post(`/work-orders/${messageWorkOrderId}/message`, {
        multipart: formData
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      messageIds.push(data.id); // Track for cleanup
      expect(data).toHaveProperty('work_order_id', messageWorkOrderId);
      expect(data).toHaveProperty('type', 'image');
      expect(data.content).toHaveProperty('images');
      expect(Array.isArray(data.content.images)).toBe(true);
      expect(data.content.images.length).toBe(1);
      expect(data.content.images[0]).toMatch(/^https:\/\/.*\.jpeg$/); // Verify image URL
      expect(data.content).toHaveProperty('text', 'Test image caption');

      // Wait for image upload to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    test('should send multiple images in one message', async () => {
      const formData = createFormData({
        files: ['IMG_0001.jpeg', 'IMG_0002.jpeg', 'IMG_0003.jpeg', 'IMG_0004.jpeg'],
        content: 'Multiple images caption'
      });

      const response = await authContext.post(`/work-orders/${messageWorkOrderId}/message`, {
        multipart: formData
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('work_order_id', messageWorkOrderId);
      expect(data).toHaveProperty('type', 'image');
      expect(data.content).toHaveProperty('images');
      expect(Array.isArray(data.content.images)).toBe(true);
      expect(data.content.images.length).toBe(4);
      expect(data.content).toHaveProperty('text', 'Multiple images caption');
    });

    test('should reject non-image files', async () => {
      const form = new FormData();
      form.append('type', 'image');
      form.append('content', 'Test text file');
      form.append('files', new Blob(['test content'], { type: 'text/plain' }), 'test.txt');

      const response = await authContext.post(`/work-orders/${messageWorkOrderId}/message`, { multipart: form });

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error.message).toContain('Only image files are allowed');
    });

    test('should reject too many images', async () => {
      const formData = createFormData({
        files: [
          'IMG_0001.jpeg', 'IMG_0002.jpeg', 'IMG_0003.jpeg',
          'IMG_0004.jpeg', 'IMG_0005.jpeg', 'IMG_0006.jpeg',
          'IMG_0007.jpeg', 'IMG_0008.jpeg', 'IMG_0009.jpeg',
          'IMG_0010.jpeg', 'IMG_0025.jpeg'
        ],
        content: 'Too many images'
      });

      const response = await authContext.post(`/work-orders/${messageWorkOrderId}/message`, {
        multipart: formData
      });

      expect(response.status()).toBe(400);
      const error = await response.json();
      expect(error.message).toContain('Too many files');
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
      expect(data).toHaveProperty('workOrderId');
      expect(data).toHaveProperty('message');
      expect(data.message.message).toEqual({
        type: 'text',
        content: 'My AC is not working'
      });
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
