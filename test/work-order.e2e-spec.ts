import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ConfigModule } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import * as Knex from 'knex';
import knexConfig from '../src/knexfile';

let knex: any;

const KNEX_CONNECTION = 'KNEX_CONNECTION';

describe('WorkOrderController (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let adminToken: string;
  let userId: number;
  let adminId: number;
  let workOrderId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({
            JWT_SECRET: 'test-secret-key',
          })],
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Add cookie-parser middleware
    app.use(cookieParser());
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Get Knex instance
    knex = moduleFixture.get<any>(KNEX_CONNECTION) || Knex(knexConfig);

    // Seed test users
    const userRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'user@test.com',
        password: 'StrongPassword123',
      });

    // Get user ID from database
    const user = await knex('users')
      .where({ email: 'user@test.com' })
      .first();
    userId = user.id;

    // Assign USER role
    await knex('users')
      .where({ id: userId })
      .update({ role: 'USER' });

    const adminRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'admin@test.com',
        password: 'StrongPassword123',
      });

    // Get admin ID from database
    const admin = await knex('users')
      .where({ email: 'admin@test.com' })
      .first();
    adminId = admin.id;

    // Assign ADMIN role
    await knex('users')
      .where({ id: adminId })
      .update({ role: 'ADMIN' });

    // Login users
    const userLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'user@test.com',
        password: 'StrongPassword123',
      });

    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'StrongPassword123',
      });

    // Get tokens from login response
    userToken = userLoginRes.headers['set-cookie'][0].split(';')[0].split('=')[1];
    adminToken = adminLoginRes.headers['set-cookie'][0].split(';')[0].split('=')[1];

    // Get user IDs from database
    const userRecord = await knex('users')
      .where({ email: 'user@test.com' })
      .first();
    userId = userRecord.id;

    const adminRecord = await knex('users')
      .where({ email: 'admin@test.com' })
      .first();
    adminId = adminRecord.id;
  });

  afterAll(async () => {
    // Clean up test data
    await knex('users')
      .where('email', 'user@test.com')
      .orWhere('email', 'admin@test.com')
      .del();

    await app.close();
  });

  describe('User Role Tests', () => {
    it('should create a work order', async () => {
      const workOrderData = {
        description: 'Test work order',
        location: 'Test location',
      };

      const response = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Cookie', `jwt=${userToken}`)
        .send(workOrderData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.user_id).toBe(userId);
      workOrderId = response.body.id;
    });

    it('should only see their own work orders', async () => {
      // Create a work order for admin
      const adminWorkOrder = await request(app.getHttpServer())
        .post('/work-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Admin work order',
          location: 'Admin location',
        });

      // User should only see their own work orders
      const response = await request(app.getHttpServer())
        .get('/work-orders')
        .set('Cookie', `jwt=${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(workOrderId);
    });
  });

  describe('Admin Role Tests', () => {
    it('should see all work orders', async () => {
      // Admin should see all work orders (1 user work order + 1 admin work order)

      // Admin should see all work orders
      const response = await request(app.getHttpServer())
        .get('/work-orders')
        .set('Cookie', `jwt=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2); // 1 user work order + 1 admin work order
    });
  });

  afterAll(async () => {
    // Clean up test data
    await knex('work_orders')
      .del();

    await knex('users')
      .where('email', 'user@test.com')
      .orWhere('email', 'admin@test.com')
      .del();
  });
});
