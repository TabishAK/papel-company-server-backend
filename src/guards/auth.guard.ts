import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';
import { CONFIG } from 'src/constants/config.constant';
// import { CONFIG } from 'src/constants/config.constant';

import { AUTH_ERRORS } from 'src/constants/responses/auth.response';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authorizationHeader = request?.headers?.authorization;

    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new HttpException(
        {
          msg: AUTH_ERRORS.UNAUTHORIZED,
          status: HttpStatus.UNAUTHORIZED,
          success: false,
          data: null,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const token = authorizationHeader.substring(7); // Remove 'Bearer ' prefix
    try {
      const secret = this.configService.getOrThrow<string>(CONFIG.JWT_SECRET);
      const decoded = jwt.verify(token, secret) as JwtPayload & {
        sub: string;
        email: string;
      };

      request['user'] = { id: decoded.sub, email: decoded.email };
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      throw new HttpException(
        {
          msg: AUTH_ERRORS.UNAUTHORIZED,
          status: HttpStatus.UNAUTHORIZED,
          success: false,
          data: null,
          error: errorMessage,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }
}
