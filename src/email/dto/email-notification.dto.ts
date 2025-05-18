import { IsEmail, IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class EmailNotificationDto {
  @IsEmail()
  @IsNotEmpty()
  to: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  template: string;

  @IsOptional()
  cc?: string[];

  @IsOptional()
  bcc?: string[];

  @IsOptional()
  attachments?: {
    filename: string;
    content: string;
    contentType: string;
  }[];
}
