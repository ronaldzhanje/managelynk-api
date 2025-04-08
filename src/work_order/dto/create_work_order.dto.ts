import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateWorkOrderDto {

  @ApiProperty({
    description: 'Detailed description of the work needed, e.g., "The faucet is old and leaking; I want a new fixture installed. Its a standard 3-hole setup."',
    example: 'The faucet is old and leaking; I want a new fixture installed. Its a standard 3-hole setup.',
  })
  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @ApiProperty({
    description: 'Location where the job will be performed (e.g., ZIP code, city/state, or full address)',
    example: '10001',
  })
  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location: string;

  @ApiProperty({
    description: 'Date on which the work is scheduled (formatted as YYYY-MM-DD)',
    example: '2023-12-01',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'Scheduled date must be in valid YYYY-MM-DD format' })
  scheduled_date?: string;
} 