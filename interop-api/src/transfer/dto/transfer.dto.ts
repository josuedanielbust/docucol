import { IsString, IsNotEmpty } from 'class-validator';

export class InitiateTransferDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  operatorId!: string;
}

export class ConfirmTransferDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  operatorId!: string;
}

export class TransferResponseDto {
  userId!: string;
  filesPath?: string;
  message?: string;
}

export class TransferCitizenDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  citizenName!: string;

  @IsString()
  @IsNotEmpty()
  citizenEmail!: string;
  
  urlDocuments!: Record<string, string[]>;

  citizenAddress?: string;

  confirmAPI!: string;
}

export class TransferCitizenConfirmDto {
  @IsNotEmpty()
  id!: string | number;

  @IsString()
  @IsNotEmpty()
  req_status!: string;
}