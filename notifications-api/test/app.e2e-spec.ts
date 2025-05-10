import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Document API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/documents (POST)', () => {
    return request(app.getHttpServer())
      .post('/documents')
      .send({
        title: 'Test Document',
        content: 'This is a test document.',
      })
      .expect(201);
  });

  it('/documents (GET)', () => {
    return request(app.getHttpServer())
      .get('/documents')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});