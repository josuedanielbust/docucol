import { IsEmail, IsNotEmpty, IsOptional, IsString, IsArray, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiPropertyOptional({ description: 'Email sender address' })
  @IsOptional()
  @IsEmail()
  from?: string;

  @ApiProperty({
    description: 'Email recipient(s)',
    example: 'user@example.com or ["user1@example.com", "user2@example.com"]',
  })
  @IsNotEmpty()
  to!: string | string[];

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

  @ApiProperty({ description: 'Email subject line' })
  @IsNotEmpty()
  @IsString()
  subject!: string;

  @ApiPropertyOptional({ description: 'Plain text email body' })
  @ValidateIf(o => !o.html)
  @IsNotEmpty()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ description: 'HTML email body' })
  @ValidateIf(o => !o.text)
  @IsNotEmpty()
  @IsString()
  html?: string;

  @ApiPropertyOptional({ description: 'Email attachments' })
  @IsOptional()
  @IsArray()
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}
