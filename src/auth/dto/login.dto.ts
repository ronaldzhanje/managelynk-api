import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'email must be an email' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: '',
  })
  @IsNotEmpty({ message: 'password should not be empty' })
  password: string;
} 