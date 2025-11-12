import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ContactUsDto {
  @ApiProperty({ description: 'The name of the sender' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'The email of the sender' })
  @IsString()
  @IsNotEmpty()
  description: string;
}
