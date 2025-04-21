import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, lastValueFrom, map } from 'rxjs';
import {
  DocumentResponseDto, 
  GetDocumentRequestDto,
  ValidateUserResponseDto,
  RegisterOperatorRequestDto,
  RegisterOperatorResponseDto
} from './dto/gov-api.dto';

@Injectable()
export class GovApiService {
  private readonly logger = new Logger(GovApiService.name);
  private readonly apiBaseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiBaseUrl = configService.get('GOV_CARPETA_BASE_URL') || '';
  }

  /**
   * Validates if a user exists in the government system
   * @param userId User validation parameters
   * @returns Validation response from the government API
   */
  async validateUser(userId: string): Promise<ValidateUserResponseDto> {
    try {
      const response = this.httpService.get(
        `${this.apiBaseUrl}/validate-user/${userId}`
      ).pipe(
        map((res) => {
          switch (res.status) {
            case HttpStatus.OK:
              return { exists: true, userId, message: res.data }
            case HttpStatus.NO_CONTENT:
              return { exists: false, userId, message: res.data }
            default:
              return { exists: false, message: res.data }
          }
        }),
        catchError(err => {
          this.logger.error(`Error validating user: ${err.message}`);
          throw new HttpException(
            err.response?.data?.message || 'Failed to validate user',
            err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
          );
        })
      );

      return await lastValueFrom(response);
    } catch (error) {
      this.logger.error(`Error in validateUser: ${(error as Error).message}`);
      throw new HttpException(
        'Failed to validate user with government system',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Register a new operator on the government API
   * @param data Operator parameters
   * @returns operator id from the government API
   */
  async registerOperator(data: RegisterOperatorRequestDto): Promise<RegisterOperatorResponseDto> {
    try {
      const operatorId = this.configService.get('OPERATOR_ID');
      if (operatorId) { return { operatorId }; }

      const { participants } = data;
      const response = this.httpService.post(
        `${this.apiBaseUrl}/registerOperator`,
        {
          ...data,
          participants: participants.split(', '),
        }
      ).pipe(
        map((res) => {
          console.log(res.data);
          return { operatorId: res.data.idOperator };
        }),
        catchError(err => {
          this.logger.error(`Error registering operator: ${err.message}`);
          throw new HttpException(
            err.response?.data?.message || 'Failed to register operator',
            err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
          );
        })
      );

      return await lastValueFrom(response);
    } catch (error) {
      this.logger.error(`Error registering operator: ${(error as Error).message}`);
      throw new HttpException(
        'Failed to register operator from government system',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Fetches document from the government API
   * @param data Document request parameters
   * @returns Document data from the government API
   */
  async getDocument(data: GetDocumentRequestDto): Promise<DocumentResponseDto> {
    try {
      const response = this.httpService.post(
        `${this.apiBaseUrl}/get-document`,
        data
      ).pipe(
        map(res => res.data),
        catchError(err => {
          this.logger.error(`Error fetching document: ${err.message}`);
          throw new HttpException(
            err.response?.data?.message || 'Failed to retrieve document',
            err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
          );
        })
      );

      return await lastValueFrom(response);
    } catch (error) {
      this.logger.error(`Error in getDocument: ${(error as Error).message}`);
      throw new HttpException(
        'Failed to retrieve document from government system',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Logs API interactions for audit purposes
   * @param userId User making the request
   * @param action Action performed
   * @param details Additional details about the interaction
   */
  private async logApiInteraction(userId: string, action: string, details: any): Promise<void> {
    try {
      // In a real implementation, this would log to a database table
      this.logger.log(`API Interaction: User ${userId} performed ${action}`);
      this.logger.debug(`Details: ${JSON.stringify(details)}`);
    } catch (error) {
      this.logger.error(`Failed to log API interaction: ${(error as Error).message}`);
    }
  }
}