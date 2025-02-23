import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {

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
  @MinLength(6, { message: 'password must be at least 6 characters' })
  password: string;
} 