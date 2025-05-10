import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, lastValueFrom, map } from 'rxjs';
const hostname = require('os').hostname();
import {
  ValidateUserResponseDto,
  RegisterOperatorRequestDto,
  RegisterOperatorResponseDto,
  AuthenticateDocumentRequestDto,
  AuthenticateDocumentResponseDto,
  RegisterUserRequestDto,
  RegisterUserResponseDto,
  UnregisterUserResponseDto,
  RegisterTransferEndpointsResponseDto,
  GetOperatorsResponseDto
} from './dto/gov-api.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class GovApiService {
  private readonly logger = new Logger(GovApiService.name);
  private readonly apiBaseUrl: string;
  private readonly OPERATORS_CACHE_KEY = 'gov:operators';
  private readonly OPERATORS_CACHE_TTL = 3600; // Cache TTL in seconds (1 hour)

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
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
              if (res.data.message && res.data.message.includes(this.configService.get('OPERATOR_NAME'))) {
                return { exists: true, userId, message: res.data }
              } else {
                return { exists: false, userId, message: res.data }
              }
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
   * Register user in the government system
   * @param data Register user parameters
   * @returns Register response from the government API
   */
  async registerUser(data: RegisterUserRequestDto): Promise<RegisterUserResponseDto> {
    try {
      const response = this.httpService.post(
        `${this.apiBaseUrl}/registerCitizen/`,
        {
          id: data.userId,
          name: data.name,
          address: data.address,
          email: data.email,
          operatorId: this.configService.get('OPERATOR_ID'),
          operatorName: this.configService.get('OPERATOR_NAME')
        }
      ).pipe(
        map((res) => {
          switch (res.status) {
            case HttpStatus.OK:
              return { registered: true, userId: data.userId, message: res.data }
            case HttpStatus.NO_CONTENT:
              return { registered: false, userId: data.userId, message: res.data }
            default:
              return { registered: false, message: res.data }
          }
        }),
        catchError(err => {
          this.logger.error(`Error registering user: ${err.message}`);
          throw new HttpException(
            err.response?.data?.message || 'Failed to register user',
            err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
          );
        })
      );

      return await lastValueFrom(response);
    } catch (error) {
      this.logger.error(`Error in registerUser: ${(error as Error).message}`);
      throw new HttpException(
        'Failed to register user with government system',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Unregister user in the government system
   * @param userId Unregister user parameters
   * @returns Unregister response from the government API
   */
  async unregisterUser(userId: string): Promise<UnregisterUserResponseDto> {
    try {
      const response = this.httpService.delete(
        `${this.apiBaseUrl}/unregisterCitizen/${userId}`,
      ).pipe(
        map((res) => {
          switch (res.status) {
            case HttpStatus.OK:
              return { unregistered: true, userId: userId, message: res.data }
            case HttpStatus.NO_CONTENT:
              return { unregistered: false, userId: userId, message: res.data }
            default:
              return { unregistered: false, message: res.data }
          }
        }),
        catchError(err => {
          this.logger.error(`Error unregistering user: ${err.message}`);
          throw new HttpException(
            err.response?.data?.message || 'Failed to unregister user',
            err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
          );
        })
      );

      return await lastValueFrom(response);
    } catch (error) {
      this.logger.error(`Error in unregisterUser: ${(error as Error).message}`);
      throw new HttpException(
        'Failed to unregister user with government system',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Register the list of operators on the government API
   * @returns list of available operators from the government API
   */
  async getOperators(useCache: boolean = true): Promise<GetOperatorsResponseDto> {
    try {
      if (useCache) {
        // Try to get operators from Redis cache first
        const cachedOperators = await this.redisService.get(this.OPERATORS_CACHE_KEY);
        
        if (cachedOperators) {
          this.logger.log('Retrieved operators from cache');
          return { operators: JSON.parse(cachedOperators) };
        }
      }
      
      // If not in cache, fetch from government API
      this.logger.log('Fetching operators from government API');
      const response = this.httpService.get(
        `${this.apiBaseUrl}/getOperators`
      ).pipe(
        map((res) => {
          return { operators: res.data };
        }),
        catchError(err => {
          this.logger.error(`Error retrieving operators: ${err.message}`);
          throw new HttpException(
            err.response?.data?.message || 'Failed to retrieve operators',
            err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
          );
        })
      );
      
      const operators = await lastValueFrom(response);
      
      // Store the result in Redis
      await this.cacheOperators(operators.operators);
      
      return { operators: operators.operators };
    } catch (error) {
      this.logger.error(`Error retrieving operators: ${(error as Error).message}`);
      throw new HttpException(
        'Failed to retrieve operators from government system',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get operator by ID from the government API with caching
   * @param operatorId The ID of the operator to retrieve
   * @returns Operator data or null if not found
   */
  async getOperatorById(operatorId: string): Promise<any> {
    try {
      const OPERATOR_CACHE_KEY = `gov:operator:${operatorId}`;
      
      // Try to get from Redis cache first
      const cachedOperator = await this.redisService.get(OPERATOR_CACHE_KEY);
      if (cachedOperator) {
        this.logger.log(`Retrieved operator ${operatorId} from cache`);
        return JSON.parse(cachedOperator);
      }
      
      // If not in cache, get all operators and find the specific one
      this.logger.log(`Operator ${operatorId} not found in cache, fetching from API`);
      const { operators } = await this.getOperators(false);
      
      const operator = operators.find(op => op._id === operatorId);
      if (!operator) {
        this.logger.warn(`Operator with ID ${operatorId} not found`);
        return null;
      }
      
      // Cache the individual operator
      await this.redisService.set(
        OPERATOR_CACHE_KEY,
        JSON.stringify(operator),
        this.OPERATORS_CACHE_TTL
      );
      
      return operator;
    } catch (error) {
      this.logger.error(`Error retrieving operator ${operatorId}: ${(error as Error).message}`);
      throw new HttpException(
        `Failed to retrieve operator with ID ${operatorId}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Cache operators data in Redis
   * @param operators The operators data to cache
   */
  private async cacheOperators(operators: any): Promise<void> {
    try {
      await this.redisService.set(
        this.OPERATORS_CACHE_KEY, 
        JSON.stringify(operators),
        this.OPERATORS_CACHE_TTL
      );
      this.logger.log('Operators data cached successfully');
    } catch (error) {
      this.logger.error(`Failed to cache operators data: ${(error as Error).message}`);
      // Continue execution even if caching fails
    }
  }

  /**
   * Invalidate the operators cache
   */
  async invalidateOperatorsCache(): Promise<void> {
    try {
      await this.redisService.del(this.OPERATORS_CACHE_KEY);
      this.logger.log('Operators cache invalidated');
    } catch (error) {
      this.logger.error(`Failed to invalidate operators cache: ${(error as Error).message}`);
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

      const transferEndpoints = await this.registerTransferEndpoints();
      
      // Invalidate operators cache when a new operator is registered
      await this.invalidateOperatorsCache();

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
   * Register transfer endpoints on the government API
   * @returns code status from the government API
   */
  async registerTransferEndpoints(): Promise<RegisterTransferEndpointsResponseDto> {
    try {
      const operatorId = this.configService.get('OPERATOR_ID');

      const baseUrl = this.configService.get('API_BASE_URL');
      
      const response = this.httpService.post(
        `${this.apiBaseUrl}/registerTransferEndPoint`,
        {
          idOperator: operatorId,
          endPoint: `${baseUrl}/transfer/receive`,
          endPointConfirm: `${baseUrl}/transfer/confirm`
        }
      ).pipe(
        map((res) => {
          console.log(res.data);
          return { operatorId, message: res.data };
        }),
        catchError(err => {
          this.logger.error(`Error registering transfer endpoints for operator: ${err.message}`);
          throw new HttpException(
        err.response?.data?.message || 'Failed to register transfer endpoints for operator',
        err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
          );
        })
      );

      return await lastValueFrom(response);
    } catch (error) {
      this.logger.error(`Error registering transfer endpoints for operator: ${(error as Error).message}`);
      throw new HttpException(
        'Failed to register transfer endpoints operator from government system',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Authenticates document with the government API
   * @param data Authenticate document request parameters
   * @returns Document authentication from the government API
   */
  async authenticateDocument(data: AuthenticateDocumentRequestDto): Promise<AuthenticateDocumentResponseDto> {
    try {
      const response = this.httpService.post(
        `${this.apiBaseUrl}/authenticateDocument`,
        {
          idCitizen: data.userId,
          UrlDocument: data.documentPath,
          documentTitle: data.documentTitle
        }
      ).pipe(
        map(res => res.data),
        catchError(err => {
          this.logger.error(`Error authenticating document: ${err.message}`);
          throw new HttpException(
            err.response?.data?.message || 'Failed to authenticate document',
            err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
          );
        })
      );

      return await lastValueFrom(response);
    } catch (error) {
      this.logger.error(`Error in authenticateDocument: ${(error as Error).message}`);
      throw new HttpException(
        'Failed to authenticate document from government system',
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