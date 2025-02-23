import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../common/dto/base-response.dto';

export class RegisterResponseDto extends BaseResponseDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier for the user',
  })
  id: number;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email of the registered user',
  })
  email: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token for authenticated sessions',
  })
  accessToken: string;
} 