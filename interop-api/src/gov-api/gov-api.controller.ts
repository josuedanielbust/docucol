import { Controller, Post, Get, Body, Param, UseGuards, Logger } from '@nestjs/common';
import { GovApiService } from './gov-api.service';
import { 
  ValidateUserResponseDto,
  GetDocumentRequestDto,
  DocumentResponseDto,
  RegisterOperatorRequestDto,
  RegisterOperatorResponseDto
} from './dto/gov-api.dto';

@Controller('gov-api')
export class GovApiController {
  private readonly logger = new Logger(GovApiController.name);

  constructor(private readonly govApiService: GovApiService) {}

  @Get('user/validate/:id')
  async validateUser(
    @Param('id') userId: string,
  ): Promise<ValidateUserResponseDto> {
    this.logger.log(`Validation requested for document ${userId}`);
    return this.govApiService.validateUser(userId);
  }

  @Post('operators')
  async registerOperator(
    @Body() registerOperatorDto: RegisterOperatorRequestDto,
  ): Promise<RegisterOperatorResponseDto> {
    this.logger.log(`Register operator request`);
    return this.govApiService.registerOperator(registerOperatorDto);
  }

  @Post('get-document')
  async getDocument(
    @Body() getDocumentDto: GetDocumentRequestDto,
  ): Promise<DocumentResponseDto> {
    this.logger.log(`Requested document ${getDocumentDto.documentId}`);
    return this.govApiService.getDocument(getDocumentDto);
  }
}