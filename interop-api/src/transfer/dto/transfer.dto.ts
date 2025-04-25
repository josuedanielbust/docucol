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