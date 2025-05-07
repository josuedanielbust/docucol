import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentEntity } from './entities/document.entity';
import { MessagingService } from '../messaging/messaging.service';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagingService: MessagingService,
    private readonly configService: ConfigService,
  ) {
    // Initialize MinIO client
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('minio.host', 'http://localhost:9000'),
      port: this.configService.get<number>('minio.port'),
      useSSL: this.configService.get<boolean>('minio.useSSL'),
      accessKey: this.configService.get<string>('minio.accessKey', ''),
      secretKey: this.configService.get<string>('minio.secretKey', ''),
    });
    this.bucketName = this.configService.get<string>('minio.bucketName', 'documents');
    
    // Ensure bucket exists on startup
    this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        this.logger.log(`Created bucket: ${this.bucketName}`);
      }
    } catch (error) {
      this.logger.error(`Error ensuring bucket exists: ${(error as Error).message}`);
      throw error;
    }
  }

  async create(createDocumentDto: CreateDocumentDto, file: Express.Multer.File): Promise<DocumentEntity> {
    // If no file was provided, throw an error
    if (!file) {
      throw new Error('No file was provided. File upload is required.');
    }
    
    // If no userId was provided, throw an error
    if (!createDocumentDto.userId || createDocumentDto.userId === '') {
      throw new Error('User ID is required.');
    }

    // Generate a UUID for the document
    const documentId = uuidv4();

    // Generate file metadata
    const fileExtension = path.extname(file.originalname);
    const fileName = `${documentId}${fileExtension}`;
    const objectName = `${createDocumentDto.userId}/${fileName}`;

    try {
      // Upload file to MinIO
      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        { 'Content-Type': file.mimetype }
      );
      
      // Create document entry in database
      const filePath = `${this.configService.get<string>('minio.publicUrl')}/${this.bucketName}/${objectName}`;
      
      const document = await this.prisma.document.create({
        data: {
          ...createDocumentDto,
          id: documentId,
          filePath,
          fileSize: file.size,
          mimeType: file.mimetype,
        },
      });

      // Send notification about the document upload
      await this.messagingService.publishDocumentUploadedEvent(
        documentId,
        document.title
      );

      return document;
    } catch (error) {
      this.logger.error(`Error uploading file to MinIO: ${(error as Error).message}`);
      throw new Error(`Failed to upload document: ${(error as Error).message}`);
    }
  }

  async findAll(): Promise<DocumentEntity[]> {
    return this.prisma.document.findMany();
  }

  async findOne(id: string): Promise<DocumentEntity | null> {
    return this.prisma.document.findUnique({
      where: { id },
    });
  }

  async deleteDocument(id: string): Promise<void> {
    // First fetch the document to get its file path
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    try {
      // Extract object name from the file path
      // The file path format is: {publicUrl}/{bucketName}/{userId}/{fileName}
      const filePath = document.filePath;
      if (!filePath) {
        throw new Error('Document file path is missing');
      }
      const urlParts = new URL(filePath);
      const pathParts = urlParts.pathname.split('/');
      
      // The object name is everything after the bucket name in the path
      // Format: {userId}/{fileName}
      const objectName = pathParts.slice(2).join('/');

      // Delete the file from MinIO
      await this.minioClient.removeObject(this.bucketName, objectName);
      this.logger.log(`Deleted file from storage: ${objectName}`);
      
      // Delete the document from the database
      await this.prisma.document.delete({
        where: { id },
      });
      
      this.logger.log(`Document with ID ${id} successfully deleted from database and storage`);
    } catch (error) {
      this.logger.error(`Failed to delete document with ID ${id}: ${(error as Error).message}`);
      throw new Error(`Failed to delete document: ${(error as Error).message}`);
    }
  }

  async findByUserId(userId: string): Promise<DocumentEntity[]> {
    if (!userId) {
      throw new Error('User ID is required to fetch documents');
    }

    const documents = await this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }, // Most recent documents first
    });

    return documents;
  }
}