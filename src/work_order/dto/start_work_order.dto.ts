import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartWorkOrderDto {
  @ApiProperty({
    description: 'Initial message to start the work order (cannot be empty)',
    example: 'I need help with my AC unit',
    minLength: 1
  })
  @IsString()
  @IsNotEmpty({ message: 'Initial message cannot be empty' })
  @MinLength(10, { message: 'Initial message must contain at least 10 characters' })
  initialMessage: string;
}
