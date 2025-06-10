import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum MessageType {
  TEXT = 'text',
  AI_RESPONSE = 'ai_response'
}

export class MessageMetadataDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  model?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  prompt_tokens?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  completion_tokens?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  total_tokens?: number;
}

export class MessageDto {
  @ApiProperty({
    enum: MessageType,
    default: MessageType.TEXT,
    description: 'Type of message'
  })
  @IsEnum(MessageType)
  type: MessageType = MessageType.TEXT;

  @ApiProperty({
    description: 'Message content',
    example: 'When will the technician arrive?'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  content: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => MessageMetadataDto)
  metadata?: MessageMetadataDto;
}

export class MessageResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  work_order_id: number;

  @ApiProperty({ nullable: true })
  user_id: number | null;

  @ApiProperty()
  type: MessageType;

  @ApiProperty()
  content: string;

  @ApiProperty({ required: false })
  metadata?: MessageMetadataDto;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}
