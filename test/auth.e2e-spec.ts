import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthModule } from '../src/auth/auth.module';
import * as Knex from 'knex';
import { Knex as KnexType } from 'knex';
import knexConfig from '../src/knexfile';

let knex: KnexType; // Declare knex with proper type

// Initialize Knex with the configuration
beforeAll(async () => {
  knex = Knex(knexConfig);
});

// Cleanup Knex connection after all tests
afterAll(async () => {
  if (knex) {
    await knex.destroy();
    knex = null;
  }
});

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let db: any;
  const testUsers = new Set<string>();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    db = knex;
  });

  afterAll(async () => {
    try {
      // Delete all test users created during tests
      if (testUsers.size > 0) {
        await knex('users').whereIn('email', Array.from(testUsers)).del();
      }
      
      // Close the NestJS application
      await app.close();
      
      // Close the Knex connection
      if (knex) {
        await knex.destroy();
        knex = null;
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
      // Don't throw error here to ensure all cleanup attempts are made
    }
  });

  beforeEach(async () => {
    // Clear the test users set before each test
    testUsers.clear();
  });

  const createTestUser = async (password: string) => {
    const timestamp = Date.now();
    const testEmail = `test_${timestamp}@example.com`;
    testUsers.add(testEmail);
    return testEmail;
  };

  // Helper function to register a user and return their credentials
  const registerUser = async (password: string) => {
    const testEmail = await createTestUser(password);
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testEmail,
        password,
      })
      .expect(201);
    return { email: testEmail, password, accessToken: response.body.accessToken };
  };

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const { email } = await registerUser('strongPassword123');
      expect(email).toBeDefined();
    });

    it('should return 409 if email already exists', async () => {
      const { email } = await registerUser('strongPassword123');
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email,
          password: 'anotherPassword',
        })
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with correct credentials', async () => {
      const { email, password } = await registerUser('loginPassword123');
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password,
        })
        .expect(201);
      expect(loginResponse.body).toEqual({ success: true });
    });

    it('should return 401 with incorrect password', async () => {
      const { email } = await registerUser('loginPassword123');
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password: 'wrongPassword',
        })
        .expect(401);
    });

    it('should return 401 with non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password',
        })
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('should return user profile with valid token', async () => {
      const { email } = await registerUser('profilePassword123');
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email,
          password: 'profilePassword123',
        })
        .expect(201);
      
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.access_token}`)
        .expect(200);
      expect(profileResponse.body).toHaveProperty('id');
      expect(profileResponse.body).toHaveProperty('email', email);
      expect(profileResponse.body).toHaveProperty('role');
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user and invalidate token', async () => {
      // Register and login to get token
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'logout@example.com',
          password: 'logoutPassword123',
        });
      
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'logout@example.com',
          password: 'logoutPassword123',
        });
      
      const accessToken = loginResponse.body.accessToken;

      // Logout
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(201);

      // Try to access profile after logout
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });
  });
});
