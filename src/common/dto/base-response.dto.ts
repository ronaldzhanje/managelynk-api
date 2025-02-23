import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto {
  @ApiProperty({
    example: 'Operation successful',
    description: 'Success message',
  })
  message: string;
} 