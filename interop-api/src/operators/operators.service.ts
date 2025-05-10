import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, lastValueFrom, map } from 'rxjs';

@Injectable()
export class OperatorsService {
  private readonly logger = new Logger(OperatorsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validates if a user exists in the government system
   * @param userId User validation parameters
   * @returns Validation response from the government API
   */
  async sendTransferRequest(path: string, data: any): Promise<any> {
    try {
      const body = {
        id: data.user.id,
        citizenName: `${data.user.first_name} ${data.user.last_name}`,
        citizenEmail: data.user.email,
        citizenAddress: data.user.address,
        urlDocuments: data.documents.reduce((result: Record<string, string[]>, item: { title: string, presignedUrl: string }) => {
          result[`${item.title}`] = [item.presignedUrl];
          return result;
        }, {})
      }

      const response = this.httpService.post(path, body).pipe(
        map((res) => {
          switch (res.status) {
            case HttpStatus.OK:
              return true
            default:
              return false
          }
        }),
        catchError(err => {
          this.logger.error(`Error sending transfer request: ${err.message}`);
          throw new HttpException(
            err.response?.data?.message || 'Failed to send transfer request',
            err.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
          );
        })
      );

      return await lastValueFrom(response);
    } catch (error) {
      this.logger.error(`Error in sendTransferRequest: ${(error as Error).message}`);
      throw new HttpException(
        'Failed to send transfer request',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}