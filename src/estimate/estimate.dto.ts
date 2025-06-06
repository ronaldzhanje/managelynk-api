import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, IsEmail } from 'class-validator';

export class EstimateDto {
  @ApiProperty({
    description: 'ID of the associated work order',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  work_order_id: number;

  @ApiProperty({
    description: 'Email address of the client who created the work order',
    example: 'client@example.com'
  })
  @IsEmail()
  @IsNotEmpty()
  client_email: string;

  @ApiProperty({
    description: 'ID of the associated vendor',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  vendor_id: number;

  @ApiProperty({
    description: 'Estimated cost',
    example: 150.75,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsNotEmpty()
  cost: number;

  @ApiProperty({
    description: 'Optional file path or URL for the estimate document',
    example: 'path/to/estimate.pdf'
  })
  @IsOptional()
  file_path?: string;

  @ApiProperty({
    description: 'Optional status of the estimate',
    example: 'pending'
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'Optional notes about the estimate',
    example: 'Additional details about the estimate'
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    example: '/uploads/estimate_123.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  file?: string;

  @ApiProperty({
    description: 'File URL for the estimate document',
    example: '/uploads/estimate_123.pdf',
    required: false,
  })
  @IsString()
  @IsOptional()
  fileUrl?: string;
}

export class EstimateResponseDto extends EstimateDto {
    @ApiProperty({ description: 'Unique identifier for the estimate', example: 1 })
    id: number;

    @ApiProperty({ description: 'Timestamp when the estimate was created', example: '2023-10-27T10:00:00.000Z' })
    created_at: Date;

    @ApiProperty({ description: 'Timestamp when the estimate was last updated', example: '2023-10-27T11:00:00.000Z' })
    updated_at: Date;
} 