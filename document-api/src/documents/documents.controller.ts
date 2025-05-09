import { Controller, Get, Post, Patch, Delete, Body, Param, UseInterceptors, UploadedFile, Query, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { DocumentEntity } from './entities/document.entity';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async createDocument(
    @Body() createDocumentDto: CreateDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<DocumentEntity> {
    return this.documentsService.create(createDocumentDto, file);
  }

  @Get('')
  findAll(): Promise<DocumentEntity[]> {
    return this.documentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<DocumentEntity | null> {
    return this.documentsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.documentsService.deleteDocument(id);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<DocumentEntity[]> {
    try {
      const documents = await this.documentsService.findByUserId(userId);
      return documents;
    } catch (error) {
      if ((error as Error).message.includes('User ID is required')) {
        throw new NotFoundException('Invalid user ID provided');
      }
      throw error;
    }
  }

  @Get('s3/:userId')
  async findS3ByUserId(@Param('userId') userId: string): Promise<any> {
    try {
      const documents = await this.documentsService.findOnS3ByUserId(userId);
      return documents;
    } catch (error) {
      if ((error as Error).message.includes('User ID is required')) {
        throw new NotFoundException('Invalid user ID provided');
      }
      throw error;
    }
  }
}