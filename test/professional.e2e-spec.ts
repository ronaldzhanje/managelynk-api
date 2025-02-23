import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ProfessionalModule } from '../src/vendor/vendor.module';
import { DatabaseModule } from '../src/database/database.module';

describe('Professional (e2e)', () => {
  let app: INestApplication;

  const sampleProfessional = {
    businessName: 'Test Plumbing',
    primaryContactName: 'Alice',
    serviceType: 'Plumbing',
    email: 'alice@testplumbing.com',
    phone: '1234567890',
    service_area: ['ZoneA', 'ZoneB'],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ProfessionalModule, DatabaseModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/professionals (POST)', () => {
    let createdProfessionalId: number;

    afterEach(async () => {
      if (createdProfessionalId) {
        await request(app.getHttpServer())
          .delete(`/professionals/${createdProfessionalId}`)
          .catch(err => console.log('Cleanup failed:', err));
      }
    });

    it('should create a new professional and return its ID', async () => {
      console.log('Sending professional data:', sampleProfessional);
      
      const response = await request(app.getHttpServer())
        .post('/professionals')
        .send(sampleProfessional)
        .expect(201)
        .then(res => {
          console.log('Response body:', res.body);
          return res;
        });

      // The service method returns an array of IDs, e.g. [123]
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      createdProfessionalId = response.body[0].id; // access the id property of the object
      expect(typeof createdProfessionalId).toBe('number');
    });
  });

  xdescribe('/professionals (GET) with query filters', () => {
    it('should retrieve professionals including our created one (no filters)', async () => {
      const response = await request(app.getHttpServer())
        .get('/professionals')
        .expect(200);

      // Expect to find at least one professional, which should include our newly created entity
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should retrieve professionals filtered by serviceType', async () => {
      const response = await request(app.getHttpServer())
        .get('/professionals')
        .query({ serviceType: 'Plumbing' })
        .expect(200);

      // Expect at least one professional with the serviceType 'Plumbing'
      expect(Array.isArray(response.body)).toBe(true);
      expect(
        response.body.some(
          (prof: any) => prof.serviceType === sampleProfessional.serviceType,
        ),
      ).toBe(true);
    });
  });

  describe('/professionals/:id (GET)', () => {
    let createdProfessionalId: number;

    it('should get the created professional by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/professionals/${createdProfessionalId}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.id).toBe(createdProfessionalId);
      expect(response.body.businessName).toBe(sampleProfessional.businessName);
    });
  });

  xdescribe('/professionals/:id (PUT)', () => {
    let createdProfessionalId: number;
    it('should update the created professional', async () => {
      const updateData = {
        businessName: 'Updated Plumbing Co',
        primaryContactName: 'Alice Updated',
      };
      const response = await request(app.getHttpServer())
        .put(`/professionals/${createdProfessionalId}`)
        .send(updateData)
        .expect(200);

      // The service returns the number of affected rows
      expect(response.body).toBe(1);

      // Verify the update by fetching the record again
      const getResponse = await request(app.getHttpServer())
        .get(`/professionals/${createdProfessionalId}`)
        .expect(200);

      expect(getResponse.body.businessName).toBe(updateData.businessName);
      expect(getResponse.body.primaryContactName).toBe(
        updateData.primaryContactName,
      );
    });
  });

  xdescribe('/professionals/:id (DELETE)', () => {
    let createdProfessionalId: number;
    it('should delete the created professional', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/professionals/${createdProfessionalId}`)
        .expect(200);

      // The service returns the number of affected rows
      expect(response.body).toBe(1);

      // Verify deletion by trying to fetch the record again
      await request(app.getHttpServer())
        .get(`/professionals/${createdProfessionalId}`)
        .expect(200)
        .then((res) => {
          // The record should ideally not exist.
          // Depending on your service or DB constraints, 
          // it might return null or throw an error. 
          // Here we check for a likely "empty" result.
          expect(res.body).toBeNull();
        });
    });
  });
});