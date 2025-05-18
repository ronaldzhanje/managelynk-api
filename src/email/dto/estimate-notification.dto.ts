import { IsEmail, IsNotEmpty, IsOptional, IsNumber, IsString } from 'class-validator';

export class EstimateNotificationDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  workOrderId: string;

  @IsNumber()
  @IsNotEmpty()
  cost: number;

  @IsString()
  @IsNotEmpty()
  vendorName: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
