import { applyDecorators } from '@nestjs/common';
import { ApiBody } from '@nestjs/swagger';

export function FileUpload() {
  return applyDecorators(
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: { type: 'string', format: 'binary', description: 'File to upload (max 10MB)' },
          folder: {
            type: 'string',
            description: 'Folder path (optional, default: uploads)',
            example: 'images',
          },
        },
        required: ['file'],
      },
    }),
  );
}
