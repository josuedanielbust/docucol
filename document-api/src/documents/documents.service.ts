import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentEntity } from './entities/document.entity';
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

  async findOnS3ByUserId(userId: string): Promise<{id: string, title: string, presignedUrl: string}[]> {
    if (!userId) {
      throw new Error('User ID is required to fetch documents');
    }

    try {
      // First get all documents for the user from the database
      const documents = await this.prisma.document.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          filePath: true,
        },
      });

      // Generate presigned URLs for each document
      const documentsWithUrls = await Promise.all(
        documents.map(async (doc) => {
          // Extract object name from the file path
          const filePath = doc.filePath;
          if (!filePath) {
            this.logger.warn(`Document ${doc.id} has no file path`);
            return { id: doc.id, title: doc.title, presignedUrl: '' };
          }
          
          const urlParts = new URL(filePath);
          const pathParts = urlParts.pathname.split('/');
          const objectName = pathParts.slice(2).join('/');

          try {
            // Generate a presigned URL (valid for 1 hour)
            const presignedUrl = await this.minioClient.presignedGetObject(
              this.bucketName,
              objectName,
              60 * 60 // 1 hour in seconds
            );
            
            return {
              id: doc.id,
              title: doc.title,
              presignedUrl,
            };
          } catch (error) {
            this.logger.error(`Error generating presigned URL for document ${doc.id}: ${(error as Error).message}`);
            return { id: doc.id, title: doc.title, presignedUrl: '' };
          }
        })
      );

      return documentsWithUrls.filter(doc => doc.presignedUrl !== '');
    } catch (error) {
      this.logger.error(`Error fetching documents with presigned URLs for user ${userId}: ${(error as Error).message}`);
      throw new Error(`Failed to fetch documents with presigned URLs: ${(error as Error).message}`);
    }
  }
}
