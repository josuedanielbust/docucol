import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

describe('Document API (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  const testUserId = uuidv4();
  let createdDocumentId: string;
  const testFilePath = path.join(__dirname, 'test-document.pdf');

  // Create a test file before running tests
  beforeAll(async () => {
    // Create test file
    fs.writeFileSync(testFilePath, 'Test file content', 'utf8');

    // Set up the NestJS application
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    prismaService = app.get<PrismaService>(PrismaService);
    
    // Clean up test data before running tests
    await prismaService.document.deleteMany({
      where: { userId: testUserId }
    });
    
    await app.init();
  });

  describe('Document Management', () => {
    it('should upload a document (POST /documents)', async () => {
      const response = await request(app.getHttpServer())
        .post('/documents')
        .field('title', 'Test Document')
        .field('userId', testUserId)
        .attach('file', testFilePath)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'Test Document');
      expect(response.body).toHaveProperty('userId', testUserId);
      expect(response.body).toHaveProperty('fileName');
      expect(response.body).toHaveProperty('filePath');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');

      createdDocumentId = response.body.id;
    });

    it('should get all documents (GET /documents)', async () => {
      const response = await request(app.getHttpServer())
        .get('/documents')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.some(doc => doc.id === createdDocumentId)).toBe(true);
    });

    it('should get documents for a specific user (GET /documents/user/:userId)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/documents/user/${testUserId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body.every(doc => doc.userId === testUserId)).toBe(true);
    });

    it('should get a specific document by ID (GET /documents/:id)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/documents/${createdDocumentId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdDocumentId);
      expect(response.body).toHaveProperty('title', 'Test Document');
      expect(response.body).toHaveProperty('userId', testUserId);
    });

    it('should handle non-existent document (GET /documents/:id)', async () => {
      const nonExistentId = uuidv4();
      await request(app.getHttpServer())
        .get(`/documents/${nonExistentId}`)
        .expect(404);
    });

    it('should delete a document (DELETE /documents/:id)', async () => {
      await request(app.getHttpServer())
        .delete(`/documents/${createdDocumentId}`)
        .expect(200);

      // Verify document was deleted
      await request(app.getHttpServer())
        .get(`/documents/${createdDocumentId}`)
        .expect(404);
    });

    it('should handle uploading document with invalid data (POST /documents)', async () => {
      await request(app.getHttpServer())
        .post('/documents')
        .field('title', '') // Empty title should be invalid
        .field('userId', testUserId)
        .attach('file', testFilePath)
        .expect(400);
    });

    it('should handle uploading document without file (POST /documents)', async () => {
      await request(app.getHttpServer())
        .post('/documents')
        .field('title', 'Test Document')
        .field('userId', testUserId)
        // No file attached
        .expect(400);
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prismaService.document.deleteMany({
      where: { userId: testUserId }
    });
    
    // Delete test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    
    // Close application
    await prismaService.$disconnect();
    await app.close();
  });
});