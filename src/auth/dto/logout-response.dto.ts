import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({
    example: 'Logout successful',
    description: 'Confirmation message upon successful logout',
  })
  message: string;
} 