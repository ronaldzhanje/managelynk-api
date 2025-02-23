import { IsNotEmpty, IsString, IsOptional, IsEmail, IsArray } from 'class-validator';

export class VendorDto {
  @IsNotEmpty()
  @IsString()
  businessName: string;

  @IsNotEmpty()
  @IsString()
  primaryContactName: string;

  @IsNotEmpty()
  @IsString()
  serviceType: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  service_area?: string[];
}