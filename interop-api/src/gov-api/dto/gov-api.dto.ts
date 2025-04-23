import { IsString, IsNotEmpty } from 'class-validator';

export class AuthenticateDocumentRequestDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  documentPath!: string;
  
  @IsString()
  @IsNotEmpty()
  documentTitle!: string;
}

export class AuthenticateDocumentResponseDto {
  message?: string;
}

export class ValidateUserResponseDto {
  exists!: boolean;
  userId?: string;
  message?: string;
}

export class RegisterOperatorRequestDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
  
  @IsString()
  @IsNotEmpty()
  address!: string;
  
  @IsString()
  @IsNotEmpty()
  contactMail!: string;
  
  @IsString()
  @IsNotEmpty()
  participants!: string;
}

export class RegisterOperatorResponseDto {
  operatorId!: string;
}
