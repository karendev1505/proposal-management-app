import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface EmailTemplate {
  to: string;
  subject: string;
  template: string;
  data?: Record<string, any>;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  data?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);
  private transporter: nodemailer.Transporter;
  private isSendGridConfigured = false;

  constructor(private configService: ConfigService) {
    this.initializeEmailProviders();
  }

  private initializeEmailProviders() {
    // Initialize SendGrid
    const sendGridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (sendGridApiKey) {
      sgMail.setApiKey(sendGridApiKey);
      this.isSendGridConfigured = true;
      this.logger.log('SendGrid initialized');
    }

    // Initialize Nodemailer
    const smtpConfig = {
      host: this.configService.get<string>('SMTP_HOST', 'localhost'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    };

    if (smtpConfig.auth.user && smtpConfig.auth.pass) {
      this.transporter = nodemailer.createTransport(smtpConfig);
      this.logger.log('Nodemailer initialized');
    } else {
      this.logger.warn('SMTP credentials not provided, email sending disabled');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Try SendGrid first if configured
      if (this.isSendGridConfigured && this.shouldUseSendGrid(options)) {
        return await this.sendWithSendGrid(options);
      }

      // Fallback to Nodemailer
      if (this.transporter) {
        return await this.sendWithNodemailer(options);
      }

      this.logger.error('No email provider configured');
      return false;
    } catch (error) {
      this.logger.error('Failed to send email:', error);
      return false;
    }
  }

  private shouldUseSendGrid(options: EmailOptions): boolean {
    // Use SendGrid for transactional emails, Nodemailer for bulk
    return !options.attachments || options.attachments.length === 0;
  }

  private async sendWithSendGrid(options: EmailOptions): Promise<boolean> {
    try {
      const msg = {
        to: Array.isArray(options.to) ? options.to : [options.to],
        from: this.configService.get<string>('FROM_EMAIL', 'noreply@proposal.com'),
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await sgMail.send(msg);
      this.logger.log(`Email sent via SendGrid to: ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error('SendGrid error:', error);
      return false;
    }
  }

  private async sendWithNodemailer(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('FROM_EMAIL', 'noreply@proposal.com'),
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent via Nodemailer to: ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error('Nodemailer error:', error);
      return false;
    }
  }

  async sendTemplateEmail(template: EmailTemplate): Promise<boolean> {
    try {
      const html = await this.renderTemplate(template.template, template.data || {});
      
      return await this.sendEmail({
        to: template.to,
        subject: template.subject,
        html,
      });
    } catch (error) {
      this.logger.error('Failed to send template email:', error);
      return false;
    }
  }

  private async renderTemplate(templateName: string, data: Record<string, any>): Promise<string> {
    try {
      const templatePath = path.join(__dirname, 'templates', `${templateName}.hbs`);
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateSource);
      return template(data);
    } catch (error) {
      this.logger.error(`Failed to render template ${templateName}:`, error);
      throw error;
    }
  }

  // Specific email methods for the application
  async sendProposalSentEmail(to: string, proposalData: any): Promise<boolean> {
    return await this.sendTemplateEmail({
      to,
      subject: 'New Proposal Sent',
      template: 'proposal-sent',
      data: proposalData,
    });
  }

  async sendProposalSignedEmail(to: string, proposalData: any): Promise<boolean> {
    return await this.sendTemplateEmail({
      to,
      subject: 'Proposal Signed',
      template: 'proposal-signed',
      data: proposalData,
    });
  }

  async sendProposalViewedEmail(to: string, proposalData: any): Promise<boolean> {
    return await this.sendTemplateEmail({
      to,
      subject: 'Proposal Viewed',
      template: 'proposal-viewed',
      data: proposalData,
    });
  }

  async sendThankYouEmail(to: string, userData: any): Promise<boolean> {
    return await this.sendTemplateEmail({
      to,
      subject: 'Thank You for Using Our Service',
      template: 'thank-you',
      data: userData,
    });
  }

  async sendWelcomeEmail(to: string, userData: any): Promise<boolean> {
    return await this.sendEmail({
      to,
      subject: 'Welcome to Proposal Management System',
      html: `
        <h1>Welcome ${userData.name}!</h1>
        <p>Thank you for joining our proposal management system.</p>
        <p>You can now create, manage, and track your proposals.</p>
        <p>Best regards,<br>The Proposal Team</p>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<boolean> {
    return await this.sendEmail({
      to,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  }
}

