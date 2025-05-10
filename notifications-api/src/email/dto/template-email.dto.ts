import { IsEmail, IsNotEmpty, IsOptional, IsString, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TemplateEmailDto {
  @ApiProperty({ description: 'Template name to use' })
  @IsNotEmpty()
  @IsString()
  templateName!: string;

  @ApiProperty({
    description: 'Email recipient(s)',
    example: 'user@example.com or ["user1@example.com", "user2@example.com"]',
  })
  @IsNotEmpty()
  to!: string | string[];

  @ApiPropertyOptional({ description: 'Email sender address' })
  @IsOptional()
  @IsEmail()
  from?: string;

  @ApiPropertyOptional({
    description: 'Carbon copy recipient(s)',
    example: 'user@example.com or ["user1@example.com", "user2@example.com"]',
  })
  @IsOptional()
  cc?: string | string[];

  @ApiPropertyOptional({
    description: 'Blind carbon copy recipient(s)',
    example: 'user@example.com or ["user1@example.com", "user2@example.com"]',
  })
  @IsOptional()
  bcc?: string | string[];

  @ApiProperty({ 
    description: 'Template context variables',
    example: '{ "name": "John Doe", "verificationLink": "https://example.com/verify" }' 
  })
  @IsObject()
  context!: Record<string, any>;

  @ApiPropertyOptional({ description: 'Email attachments' })
  @IsOptional()
  @IsArray()
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}
