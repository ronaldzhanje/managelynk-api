import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';
import { EstimateNotificationDto } from './dto/estimate-notification.dto';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('estimate')
  async sendEstimateNotification(@Body() body: EstimateNotificationDto) {
    try {
      await this.emailService.sendEstimateNotification(body);
      return { success: true, message: 'Test email sent successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}
