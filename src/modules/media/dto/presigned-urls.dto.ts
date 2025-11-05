import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class FileMetadata {
  contentType: string;
  path: string;
}

export class PresignedUrlsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FileMetadata)
  files: FileMetadata[];
}
