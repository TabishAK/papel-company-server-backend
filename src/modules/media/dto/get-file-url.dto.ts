import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class GetFileUrlDto {
  @IsNotEmpty()
  @IsString()
  key: string;

  @IsOptional()
  @IsNumber()
  expiresIn?: number;
}
