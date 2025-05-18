import { Injectable, Inject, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';
import { EmailNotificationDto } from './dto/email-notification.dto';
import { EstimateNotificationDto } from './dto/estimate-notification.dto';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject('SENDGRID_CONFIG') private readonly sendgridConfig: {
      apiKey: string;
      fromEmail: string;
    }
  ) {
    sgMail.setApiKey(this.sendgridConfig.apiKey);
  }

  async sendEmail(notification: EmailNotificationDto) {
    try {
      const msg = {
        to: notification.to,
        from: this.sendgridConfig.fromEmail,
        subject: notification.subject,
        text: notification.template,
        html: notification.template,
        cc: notification.cc,
        bcc: notification.bcc,
        attachments: notification.attachments
      };

      await sgMail.send(msg);
      this.logger.log(`Email sent successfully to ${notification.to}`);
      return { success: true, message: 'Email sent successfully' };
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendEstimateNotification(notification: EstimateNotificationDto) {
    try {
      const template = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">New Estimate Created</h1>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
            <p><strong>Work Order ID:</strong> ${notification.workOrderId}</p>
            <p><strong>Vendor:</strong> ${notification.vendorName}</p>
            <p><strong>Estimated Amount:</strong> $${notification.cost}</p>
            ${notification.status ? `<p><strong>Status:</strong> ${notification.status}</p>` : ''}
            ${notification.notes ? `<p><strong>Notes:</strong> ${notification.notes}</p>` : ''}
            <p><strong>Created:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        </div>`;

      const emailNotification: EmailNotificationDto = {
        to: notification.to,
        subject: `New Estimate Created - ${notification.workOrderId}`,
        template,
        cc: [],
        bcc: [],
        attachments: []
      };

      return await this.sendEmail(emailNotification);
    } catch (error) {
      this.logger.error('Failed to send estimate notification', error);
      throw new Error(`Failed to send estimate notification: ${error.message}`);
    }
  }
}
