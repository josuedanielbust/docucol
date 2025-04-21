e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

describe('Gov API (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  const testUserId = uuidv4();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prismaService = app.get<PrismaService>(PrismaService);
    
    await app.init();

    // Create a test user and get authentication token
    // This is a simplified example - in a real scenario you'd interact with your auth system
    const user = await prismaService.user.create({
      data: {
        id: testUserId,
        first_name: 'Test',
        last_name: 'User',
        address: '123 Test St',
        city: 'Test City',
        department: 'Test Department',
        email: 'test-gov-api@example.com',
        password: 'hashedpassword', // In real implementation, this would be hashed
      },
    });

    // Get auth token - in this test we're mocking it since we can't call the actual auth service directly
    const response = await request(app.getHttpServer())
      .post('/auth/signin')
      .send({
        email: 'test-gov-api@example.com',
        password: 'Password123!'  // This would be the unhashed version
      });
    
    authToken = response.body.access_token;
  });

  describe('Gov API Integration', () => {
    it('should validate a user (POST /gov-api/validate-user)', async () => {
      const response = await request(app.getHttpServer())
        .post('/gov-api/validate-user')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          documentType: 'CC',
          documentNumber: '1234567890',
          firstName: 'John',
          lastName: 'Doe'
        })
        .expect(201);

      expect(response.body).toHaveProperty('exists');
      expect(response.body).toHaveProperty('message');
    });

    it('should get a document (POST /gov-api/get-document)', async () => {
      const response = await request(app.getHttpServer())
        .post('/gov-api/get-document')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          documentId: 'doc-123',
          userId: testUserId,
          includeMetadata: true
        })
        .expect(201);

      expect(response.body).toHaveProperty('documentId');
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('content');
    });

    it('should get document history (GET /gov-api/document-history/:id)', async () => {
      const response = await request(app.getHttpServer())
        .get('/gov-api/document-history/doc-123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('documentId');
      expect(response.body).toHaveProperty('history');
      expect(Array.isArray(response.body.history)).toBe(true);
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prismaService.user.delete({
      where: { id: testUserId }
    });
    
    await prismaService.$disconnect();
    await app.close();
  });
});