import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class GetDocumentRequestDto {
  @IsString()
  @IsNotEmpty()
  documentId!: string;

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsBoolean()
  @IsOptional()
  includeMetadata?: boolean;
}

export class DocumentResponseDto {
  documentId!: string;
  title!: string;
  contentType!: string;
  issuedBy!: string;
  issuedDate!: string;
  expirationDate?: string;
  content!: string; // Base64 encoded document content
  metadata?: Record<string, any>;
}

export class ValidateUserResponseDto {
  exists!: boolean;
  userId?: string;
  message?: string;
}

export class RegisterOperatorRequestDto {
  name!: string;
  address!: string;
  contactMail!: string;
  participants!: string;
}

export class RegisterOperatorResponseDto {
  operatorId!: string;
}
