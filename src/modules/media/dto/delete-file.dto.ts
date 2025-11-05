import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteFileDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  folder: string;
}
