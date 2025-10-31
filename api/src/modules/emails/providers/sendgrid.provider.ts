import { Injectable, Logger } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import { IEmailProvider, EmailOptions } from '../interfaces/email-provider.interface';

@Injectable()
export class SendGridProvider implements IEmailProvider {
  private readonly logger = new Logger(SendGridProvider.name);

  constructor(
    apiKey: string,
    private readonly defaultFrom: string,
  ) {
    SendGrid.setApiKey(apiKey);
  }

  async sendMail(options: EmailOptions): Promise<void> {
    try {
      await SendGrid.send({
        to: options.to,
        from: this.defaultFrom,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      this.logger.log(`Email sent successfully to ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      throw error;
    }
  }
}
