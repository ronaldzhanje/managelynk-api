import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'SENDGRID_CONFIG',
      useFactory: (configService: ConfigService) => ({
        apiKey: configService.get<string>('SENDGRID_API_KEY'),
        fromEmail: configService.get<string>('SENDGRID_FROM_EMAIL')
      }),
      inject: [ConfigService],
    },
    EmailService
  ],
  controllers: [EmailController],
  exports: ['SENDGRID_CONFIG', EmailService],
})
export class EmailModule {}
