import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { v4 as uuidv4 } from 'uuid';

describe('Transfer API (e2e)', () => {
  let app: INestApplication;
  let transferId: string;
  const mockDocumentId = uuidv4();
  const mockFromUserId = uuidv4();
  const mockToUserId = uuidv4();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    await app.init();
  });

  describe('Transfer Flows', () => {
    it('should initiate a document transfer (POST /transfer/initiate)', async () => {
      // This test assumes Document API and Users API endpoints are mocked
      // or that TransferService validates these externally
      const response = await request(app.getHttpServer())
        .post('/transfer/initiate')
        .send({
          documentId: mockDocumentId,
          fromUserId: mockFromUserId,
          toUserId: mockToUserId,
          reason: 'Transferring for collaborative review'
        })
        .expect(201);

      expect(response.body).toHaveProperty('transferId');
      expect(response.body).toHaveProperty('documentId', mockDocumentId);
      expect(response.body).toHaveProperty('fromUserId', mockFromUserId);
      expect(response.body).toHaveProperty('toUserId', mockToUserId);
      expect(response.body).toHaveProperty('status', 'initiated');
      
      transferId = response.body.transferId;
    });

    it('should confirm a document transfer (POST /transfer/confirm)', async () => {
      const response = await request(app.getHttpServer())
        .post('/transfer/confirm')
        .send({
          transferId: transferId,
          userId: mockToUserId,
          accepted: true
        })
        .expect(201);

      expect(response.body).toHaveProperty('transferId', transferId);
      expect(response.body).toHaveProperty('status', 'confirmed');
    });

    it('should reject a document transfer (POST /transfer/confirm)', async () => {
      // First, initiate a new transfer for this test
      const initiateResponse = await request(app.getHttpServer())
        .post('/transfer/initiate')
        .send({
          documentId: mockDocumentId,
          fromUserId: mockFromUserId,
          toUserId: mockToUserId,
          reason: 'Another transfer to reject'
        });
      
      const newTransferId = initiateResponse.body.transferId;

      const response = await request(app.getHttpServer())
        .post('/transfer/confirm')
        .send({
          transferId: newTransferId,
          userId: mockToUserId,
          accepted: false,
          rejectionReason: 'Document no longer needed'
        })
        .expect(201);

      expect(response.body).toHaveProperty('transferId', newTransferId);
      expect(response.body).toHaveProperty('status', 'rejected');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Document no longer needed');
    });

    it('should get transfer details (GET /transfer/:transferId)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/transfer/${transferId}`)
        .expect(200);

      expect(response.body).toHaveProperty('transferId', transferId);
      expect(response.body).toHaveProperty('documentId', mockDocumentId);
      expect(response.body).toHaveProperty('fromUserId', mockFromUserId);
      expect(response.body).toHaveProperty('toUserId', mockToUserId);
    });

    it('should list all transfers for a user (GET /transfer/user/:userId)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/transfer/user/${mockToUserId}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // The user should have at least one transfer
      expect(response.body.length).toBeGreaterThan(0);
      // Check if the transfer we created is in the list
      expect(response.body.some((transfer: any) => transfer.transferId === transferId)).toBe(true);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});