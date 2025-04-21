import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentEntity } from './entities/document.entity';
import { MessagingService } from '../messaging/messaging.service';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

@Injectable()
export class DocumentsService {
  private readonly uploadsDirectory: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagingService: MessagingService,
  ) {
    // Define your uploads directory - can also come from config
    this.uploadsDirectory = process.env.UPLOADS_DIRECTORY || path.join(process.cwd(), 'uploads');
    // Ensure the directory exists
    this.ensureUploadsDirectory();
  }

  private async ensureUploadsDirectory(): Promise<void> {
    try {
      await mkdirAsync(this.uploadsDirectory, { recursive: true });
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
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
    const filePath = path.join(this.uploadsDirectory, fileName);

    // Save file to disk
    await writeFileAsync(filePath, file.buffer);
    
    // Create document entry in database
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
    await this.prisma.document.delete({
      where: { id },
    });
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