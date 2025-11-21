import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailProvider, EmailOptions, EmailConfig } from '../interfaces/email-provider.interface';
import { SendGridProvider } from '../providers/sendgrid.provider';
import { NodemailerProvider } from '../providers/nodemailer.provider';
import { TemplateService } from './template.service';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private provider: IEmailProvider;

  constructor(
    private readonly configService: ConfigService,
    private readonly templateService: TemplateService,
  ) {
    this.initializeProvider();
  }

  async onModuleInit() {
    await this.templateService.loadTemplates();
  }

  private initializeProvider() {
    const config: EmailConfig = {
      mode: this.configService.get('EMAIL_MODE', 'disabled'),
      from: this.configService.get('EMAIL_FROM', 'noreply@example.com'),
      smtp: this.configService.get('EMAIL_SMTP'),
      sendgrid: this.configService.get('EMAIL_SENDGRID'),
    };

    switch (config.mode) {
      case 'sendgrid':
        if (!config.sendgrid?.apiKey) {
          throw new Error('SendGrid API key is required when using sendgrid mode');
        }
        this.provider = new SendGridProvider(config.sendgrid.apiKey, config.from);
        break;

      case 'smtp':
        if (!config.smtp) {
          throw new Error('SMTP configuration is required when using smtp mode');
        }
        this.provider = new NodemailerProvider(config.smtp, config.from);
        break;

      case 'disabled':
        this.logger.warn('Email sending is disabled');
        this.provider = {
          async sendMail(options: EmailOptions) {
            this.logger.debug('Email sending is disabled. Would have sent:', {
              to: options.to,
              subject: options.subject,
              template: options.template,
              context: options.context,
            });
          },
        };
        break;

      default:
        throw new Error(`Unknown email mode: ${config.mode}`);
    }
  }

  async sendMail(options: EmailOptions): Promise<void> {
    if (options.template) {
      const html = this.templateService.renderTemplate(options.template, options.context || {});
      options.html = html;
    }

    await this.provider.sendMail(options);
  }

  async previewTemplate(templateName: string, context: Record<string, any>): Promise<string> {
    return this.templateService.renderTemplate(templateName, context);
  }

  getAvailableTemplates(): string[] {
    return this.templateService.getTemplateNames();
  }
}
