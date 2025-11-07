import axios from 'axios';
import * as mime from 'mime';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { CONFIG } from 'src/constants/config.constant';

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  CreateBucketCommand,
  BucketLocationConstraint,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SerializeHttpResponse } from 'src/utils/serializer.util';
import { Injectable, HttpException, HttpStatus, Logger, OnModuleInit } from '@nestjs/common';

export interface FileBufferDto {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@Injectable()
export class MediaService implements OnModuleInit {
  private readonly logger = new Logger(MediaService.name);
  private s3Client: S3Client;
  private bucketName: string;
  private endpoint: string;
  private publicBaseUrl: string;
  private region = 'us-east-1';
  private isProxied: boolean;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>(CONFIG.MINIO_ENDPOINT) || 'localhost';
    const port = this.configService.get<string>(CONFIG.MINIO_PORT) || '9000';
    const useSSL = this.configService.get<string>(CONFIG.MINIO_USE_SSL) === 'true';
    this.bucketName = this.configService.get<string>(CONFIG.MINIO_BUCKET_NAME) || 'papel-tenant';

    const protocol = useSSL ? 'https' : 'http';

    // ✅ Identify whether we're behind nginx proxy (production) - prefer explicit env flag for clarity
    const behindProxy = this.configService.get<string>(CONFIG.MINIO_BEHIND_PROXY) === 'true';
    this.isProxied = behindProxy;

    // ✅ Construct endpoint for S3Client
    // IMPORTANT: S3Client endpoint should NOT include /storage path
    // The SDK cannot handle paths in endpoints properly for signature calculation
    // Production → https://domain.com (no path)
    // Local → http://localhost:9000
    this.endpoint = this.isProxied
      ? `${protocol}://${endpoint}`
      : `${protocol}://${endpoint}:${port}`;

    // Public URL for clients (includes /storage when proxied for public file access)
    this.publicBaseUrl = this.isProxied
      ? `${protocol}://${endpoint}/storage`
      : `${protocol}://${endpoint}:${port}`;

    // ✅ Initialize S3/MinIO client
    this.s3Client = new S3Client({
      endpoint: this.endpoint,
      region: this.region,
      forcePathStyle: true,

      credentials: {
        accessKeyId: this.configService.get<string>(CONFIG.MINIO_ACCESS_KEY) || 'minioadmin',
        secretAccessKey: this.configService.get<string>(CONFIG.MINIO_SECRET_KEY) || 'minioadmin',
      },
    });

    this.logger.log(`🪣 MinIO Configured:
      - S3 Client Endpoint: ${this.endpoint}
      - Public Base URL: ${this.publicBaseUrl}
      - Bucket: ${this.bucketName}
      - Behind Proxy: ${this.isProxied}
      - SSL: ${useSSL}
    `);
  }

  async onModuleInit() {
    await this.ensureBucketExists();
    await this.initializeBucketPolicy();
  }

  private async initializeBucketPolicy() {
    try {
      const bucketPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };

      const command = new PutBucketPolicyCommand({
        Bucket: this.bucketName,
        Policy: JSON.stringify(bucketPolicy),
      });

      await this.s3Client.send(command);
    } catch (error) {
      this.logger.warn(`Could not set bucket policy: ${error.message}`);
    }
  }

  /** Ensure bucket exists, create if missing */
  private async ensureBucketExists(): Promise<void> {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucketName }));
      this.logger.log(`✅ Bucket "${this.bucketName}" verified`);
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        this.logger.warn(`Bucket "${this.bucketName}" not found — creating...`);
        try {
          await this.s3Client.send(
            new CreateBucketCommand({
              Bucket: this.bucketName,
              ...(this.region !== 'us-east-1' && {
                CreateBucketConfiguration: {
                  LocationConstraint: this.region as BucketLocationConstraint,
                },
              }),
            }),
          );
          this.logger.log(`✅ Bucket "${this.bucketName}" created`);
        } catch (createErr) {
          this.logger.error(`❌ Failed to create bucket: ${createErr.message}`);
        }
      } else {
        this.logger.error(`❌ Failed to connect to MinIO: ${error.message}`);
      }
    }
  }

  /** Generate public URL */
  private generatePublicUrl(fileKey: string): string {
    return `${this.publicBaseUrl}/${this.bucketName}/${fileKey}`;
  }

  /** Generate a single presigned upload URL */
  async getPreSignedUrl(contentType: string, path: string) {
    try {
      const ext = mime.extension(contentType);
      const key = `${path}/${uuidv4()}.${ext}`;
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });
      const url = await getSignedUrl(this.s3Client, command, { expiresIn: 60 * 5 });
      return SerializeHttpResponse({ url, key }, HttpStatus.OK, 'Presigned URL generated');
    } catch (err) {
      throw new HttpException(`Failed to sign URL: ${err.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  /** Generate multiple presigned URLs */
  async getPreSignedUrls(fileMetadata: { contentType: string; path: string }[]) {
    const signed: { url: string; key: string }[] = [];
    for (const { contentType, path } of fileMetadata) {
      const ext = mime.extension(contentType);
      const key = `${path}/${uuidv4()}.${ext}`;
      const cmd = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });
      const url = await getSignedUrl(this.s3Client, cmd, { expiresIn: 60 * 5 });
      signed.push({ url, key });
    }
    return SerializeHttpResponse(signed, HttpStatus.OK, 'Presigned URLs generated');
  }

  /** Upload file directly */
  async uploadFile(file: Express.Multer.File, folder = 'uploads') {
    try {
      const ext = file.originalname.split('.').pop();
      const fileKey = `${folder}/${uuidv4()}.${ext}`;
      const cmd = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(cmd);
      const url = this.generatePublicUrl(fileKey);

      return { key: fileKey, url };
    } catch (err) {
      throw new HttpException(`Upload failed: ${err.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  /** Upload via presigned URL */
  async uploadToS3(file: Express.Multer.File | FileBufferDto, url: string) {
    try {
      await axios.put(url, file.buffer, { headers: { 'Content-Type': file.mimetype } });
    } catch (err) {
      throw new HttpException(`Upload failed: ${err.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  /** Delete file */
  async deleteFromS3(fileKey: string) {
    try {
      const cmd = new DeleteObjectCommand({ Bucket: this.bucketName, Key: fileKey });
      await this.s3Client.send(cmd);
      return SerializeHttpResponse({}, HttpStatus.OK, 'File deleted successfully');
    } catch (err) {
      throw new HttpException(`Delete failed: ${err.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}
