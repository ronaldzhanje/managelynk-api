import { IsNotEmpty, IsString, IsOptional, IsEmail, IsDate, IsObject } from 'class-validator';

export class VendorDto {
  @IsNotEmpty()
  @IsString()
  businessName: string;

  @IsOptional()
  @IsString()
  licenseType?: string;

  @IsOptional()
  @IsString()
  licenseNo?: string;

  @IsOptional()
  @IsString()
  licenseStatus?: string;

  @IsOptional()
  @IsDate()
  issueDate?: Date;

  @IsOptional()
  @IsDate()
  expirationDate?: Date;

  @IsOptional()
  @IsString()
  addrLine1?: string;

  @IsOptional()
  @IsString()
  addrLine2?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipcode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  disciplinaryAction?: string;

  @IsOptional()
  @IsString()
  docketNumber?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsObject()
  qualifier?: any;

  @IsOptional()
  @IsString()
  primaryContactName?: string;

  @IsOptional()
  @IsObject()
  services?: any;
}