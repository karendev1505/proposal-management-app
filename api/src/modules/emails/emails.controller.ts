import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EmailsService, EmailOptions, EmailTemplate } from './emails.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

export class SendEmailDto {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  template?: string;
  data?: Record<string, any>;
}

export class SendTemplateEmailDto {
  to: string;
  subject: string;
  template: string;
  data?: Record<string, any>;
}

@Controller('emails')
@UseGuards(JwtAuthGuard)
export class EmailsController {
  constructor(private emailsService: EmailsService) {}

  @Post('send')
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    const options: EmailOptions = {
      to: sendEmailDto.to,
      subject: sendEmailDto.subject,
      html: sendEmailDto.html,
      text: sendEmailDto.text,
      template: sendEmailDto.template,
      data: sendEmailDto.data,
    };

    const success = await this.emailsService.sendEmail(options);
    return {
      success,
      message: success ? 'Email sent successfully' : 'Failed to send email',
    };
  }

  @Post('send-template')
  async sendTemplateEmail(@Body() sendTemplateEmailDto: SendTemplateEmailDto) {
    const template: EmailTemplate = {
      to: sendTemplateEmailDto.to,
      subject: sendTemplateEmailDto.subject,
      template: sendTemplateEmailDto.template,
      data: sendTemplateEmailDto.data,
    };

    const success = await this.emailsService.sendTemplateEmail(template);
    return {
      success,
      message: success ? 'Template email sent successfully' : 'Failed to send template email',
    };
  }

  @Post('send-proposal-sent')
  async sendProposalSentEmail(@Body() body: { to: string; proposalData: any }) {
    const success = await this.emailsService.sendProposalSentEmail(body.to, body.proposalData);
    return {
      success,
      message: success ? 'Proposal sent email delivered' : 'Failed to send proposal sent email',
    };
  }

  @Post('send-proposal-signed')
  async sendProposalSignedEmail(@Body() body: { to: string; proposalData: any }) {
    const success = await this.emailsService.sendProposalSignedEmail(body.to, body.proposalData);
    return {
      success,
      message: success ? 'Proposal signed email delivered' : 'Failed to send proposal signed email',
    };
  }

  @Post('send-proposal-viewed')
  async sendProposalViewedEmail(@Body() body: { to: string; proposalData: any }) {
    const success = await this.emailsService.sendProposalViewedEmail(body.to, body.proposalData);
    return {
      success,
      message: success ? 'Proposal viewed email delivered' : 'Failed to send proposal viewed email',
    };
  }

  @Post('send-welcome')
  async sendWelcomeEmail(@Body() body: { to: string; userData: any }) {
    const success = await this.emailsService.sendWelcomeEmail(body.to, body.userData);
    return {
      success,
      message: success ? 'Welcome email delivered' : 'Failed to send welcome email',
    };
  }

  @Post('send-password-reset')
  async sendPasswordResetEmail(@Body() body: { to: string; resetLink: string }) {
    const success = await this.emailsService.sendPasswordResetEmail(body.to, body.resetLink);
    return {
      success,
      message: success ? 'Password reset email delivered' : 'Failed to send password reset email',
    };
  }
}
