import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Users API (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    prismaService = app.get<PrismaService>(PrismaService);
    
    // Clear test database before tests
    await prismaService.user.deleteMany({
      where: { email: 'test@example.com' }
    });
    
    await app.init();
  });

  describe('Auth', () => {
    it('/auth/signup (POST)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          id: '12345678-1234-1234-1234-123456789012',
          first_name: 'Test',
          last_name: 'User',
          address: '123 Test St',
          city: 'Test City',
          department: 'Test Department',
          email: 'test@example.com',
          password: 'Password123!'
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).not.toHaveProperty('password');
      
      userId = response.body.user.id;
      authToken = response.body.access_token;
    });

    it('/auth/signin (POST)', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user).not.toHaveProperty('password');
    });
  });

  describe('Users', () => {
    it('/users (GET)', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('/users/:id (GET)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('email', 'test@example.com');
      expect(response.body).not.toHaveProperty('password');
    });

    it('/users/:id (PATCH)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          first_name: 'Updated',
          last_name: 'Name'
        })
        .expect(200);

      expect(response.body).toHaveProperty('id', userId);
      expect(response.body).toHaveProperty('first_name', 'Updated');
      expect(response.body).toHaveProperty('last_name', 'Name');
      expect(response.body).not.toHaveProperty('password');
    });

    it('/users/:id (DELETE)', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify user was deleted
      const deletedUser = await prismaService.user.findUnique({
        where: { id: userId }
      });
      expect(deletedUser).toBeNull();
    });
  });

  afterAll(async () => {
    // Clean up any remaining test data
    await prismaService.user.deleteMany({
      where: { email: 'test@example.com' }
    });
    
    await prismaService.$disconnect();
    await app.close();
  });
});