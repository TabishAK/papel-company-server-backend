import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';

import { SerializeHttpResponse } from 'src/utils/serializer.util';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from 'src/constants/config.constant';

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly apiKey: string;
  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>(CONFIG.COMPANY_API_KEY) || '';
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'] as string;

    console.log('apiKey', apiKey);

    if (!apiKey) {
      return SerializeHttpResponse(null, HttpStatus.UNAUTHORIZED, 'Missing company credentials');
    }

    try {
      if (apiKey !== this.apiKey) {
        return SerializeHttpResponse(null, HttpStatus.UNAUTHORIZED, 'Invalid company credentials');
      }

      console.log('apiKey is valid');

      return true;
    } catch (error: unknown) {
      if (error instanceof HttpException) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return SerializeHttpResponse(null, HttpStatus.INTERNAL_SERVER_ERROR, errorMessage);
    }
  }
}
