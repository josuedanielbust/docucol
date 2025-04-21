import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  filePath!: string;

  @IsNumber()
  @IsNotEmpty()
  fileSize!: number;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;
}