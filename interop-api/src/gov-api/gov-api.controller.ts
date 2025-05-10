import { Controller, Post, Get, Body, Param, Logger, Delete } from '@nestjs/common';
import { GovApiService } from './gov-api.service';
import { 
  ValidateUserResponseDto,
  RegisterOperatorRequestDto,
  RegisterOperatorResponseDto,
  AuthenticateDocumentRequestDto,
  AuthenticateDocumentResponseDto,
  RegisterUserRequestDto,
  RegisterUserResponseDto,
  UnregisterUserResponseDto,
  GetOperatorsResponseDto
} from './dto/gov-api.dto';

@Controller('gov-api')
export class GovApiController {
  private readonly logger = new Logger(GovApiController.name);

  constructor(private readonly govApiService: GovApiService) {}

  @Post('user')
  async registerUser(
    @Body() registerUser: RegisterUserRequestDto,
  ): Promise<RegisterUserResponseDto> {
    this.logger.log(`Register user for document ${registerUser.userId}`);
    return this.govApiService.registerUser(registerUser);
  }
  
  @Delete('user/:id')
  async unregisterUser(
    @Param('id') userId: string,
  ): Promise<UnregisterUserResponseDto> {
    this.logger.log(`Register user for document ${userId}`);
    return this.govApiService.unregisterUser(userId);
  }
  
  @Get('user/validate/:id')
  async validateUser(
    @Param('id') userId: string,
  ): Promise<ValidateUserResponseDto> {
    this.logger.log(`Validation requested for document ${userId}`);
    return this.govApiService.validateUser(userId);
  }

  @Get('operators')
  async getOperators(): Promise<GetOperatorsResponseDto> {
    this.logger.log(`Retrieve operators request`);
    return this.govApiService.getOperators();
  }

  @Post('operators')
  async registerOperator(
    @Body() registerOperatorDto: RegisterOperatorRequestDto,
  ): Promise<RegisterOperatorResponseDto> {
    this.logger.log(`Register operator request`);
    return this.govApiService.registerOperator(registerOperatorDto);
  }

  @Post('documents/authenticate')
  async getDocument(
    @Body() authenticateDocument: AuthenticateDocumentRequestDto,
  ): Promise<AuthenticateDocumentResponseDto> {
    this.logger.log(`Requested document ${authenticateDocument.documentTitle}`);
    return this.govApiService.authenticateDocument(authenticateDocument);
  }
}