import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { IEmailProvider, EmailOptions } from '../interfaces/email-provider.interface';

@Injectable()
export class NodemailerProvider implements IEmailProvider {
  private readonly logger = new Logger(NodemailerProvider.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly smtpConfig: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    },
    private readonly defaultFrom: string,
  ) {
    this.transporter = nodemailer.createTransport(smtpConfig);
  }

  async sendMail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.defaultFrom,
        to: options.to,
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
