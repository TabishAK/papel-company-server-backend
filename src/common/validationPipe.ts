/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  ValidationPipe,
  HttpStatus,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';

export class CustomValidationPipe {
  private validationPipe: ValidationPipe;

  constructor(options) {
    this.validationPipe = new ValidationPipe({
      ...options,
      exceptionFactory: (validationErrors) => {
        const errors = this.flattenValidationErrors(validationErrors);
        return new BadRequestException({
          message: errors[0],
          status: HttpStatus.BAD_REQUEST,
          data: null,
        });
      },
    });
  }

  async transform(value, metadata): Promise<unknown> {
    return await this.validationPipe.transform(value, metadata);
  }

  private flattenValidationErrors(
    validationErrors: ValidationError[],
  ): string[] {
    const result: string[] = [];
    validationErrors.forEach((error) => {
      if (error.constraints) {
        result.push(...Object.values(error.constraints));
      }
      if (error.children && error.children.length) {
        result.push(...this.flattenValidationErrors(error.children));
      }
    });
    return result;
  }
}
