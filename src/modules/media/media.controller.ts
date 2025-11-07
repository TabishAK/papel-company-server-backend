import {
  Controller,
  Post,
  Body,
  Delete,
  Query,
  Get,
  UploadedFile,
  ParseFilePipe,
  UseInterceptors,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { PresignedUrlDto } from './dto/presigned-url.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PresignedUrlsDto } from './dto/presigned-urls.dto';
import { ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FileUpload } from 'src/decorators/file-upload.decorator';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file to MinIO storage' })
  @ApiConsumes('multipart/form-data')
  @FileUpload()
  async uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
  ) {
    return this.mediaService.uploadFile(file, uploadFileDto.folder);
  }

  @Post('presigned-url')
  @ApiOperation({ summary: 'Generate a pre-signed URL for file upload' })
  @ApiResponse({ status: 200, description: 'Pre-signed URL generated successfully' })
  async getPreSignedUrl(@Body() presignedUrlDto: PresignedUrlDto) {
    return this.mediaService.getPreSignedUrl(presignedUrlDto.contentType, presignedUrlDto.path);
  }

  @Post('presigned-urls')
  @ApiOperation({ summary: 'Generate multiple pre-signed URLs for file uploads' })
  @ApiResponse({ status: 200, description: 'Pre-signed URLs generated successfully' })
  async getPreSignedUrls(@Body() presignedUrlsDto: PresignedUrlsDto) {
    return this.mediaService.getPreSignedUrls(presignedUrlsDto.files);
  }

  @Get('health-check')
  @ApiOperation({ summary: 'Check the health of the media service' })
  @ApiResponse({ status: 200, description: 'Media service is healthy' })
  async healthCheck() {
    return { status: 'healthy' };
  }

  //   @Post('file-url')
  //   @ApiOperation({ summary: 'Get a pre-signed URL to access/download a file' })
  //   @ApiResponse({ status: 200, description: 'File URL generated successfully' })
  //   async getFileUrl(@Body() getFileUrlDto: GetFileUrlDto) {
  //     return this.mediaService.getFileUrl(getFileUrlDto.key, getFileUrlDto.expiresIn);
  //   }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete a file from storage' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Query('url') url: string, @Query('folder') folder: string) {
    return this.mediaService.deleteFromS3(url);
  }
}
