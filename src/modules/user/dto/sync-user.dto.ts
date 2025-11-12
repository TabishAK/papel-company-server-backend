import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SyncEmployeeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isActive: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  fullName: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  contactNumber: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  companyId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  departmentId: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  sectionId: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  securityLevel: number;
}
