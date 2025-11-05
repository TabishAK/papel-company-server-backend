import { IsNotEmpty, IsString } from 'class-validator';

export class PresignedUrlDto {
  @IsNotEmpty()
  @IsString()
  contentType: string;

  @IsNotEmpty()
  @IsString()
  path: string;
}
