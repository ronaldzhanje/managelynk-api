import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateWorkOrderDto {
  @ApiProperty({
    description: 'Concise title of the project/job, e.g., "Replace Bathroom Faucet".',
    example: 'Replace Bathroom Faucet',
  })
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(100, { message: 'Title must be at most 100 characters' })
  title: string;

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
} 