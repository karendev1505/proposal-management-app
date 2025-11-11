import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  BadRequestException 
} from '@nestjs/common';
import { EmailsService } from './emails.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { 
  EmailPayload, 
  EmailContext, 
  EmailTemplateType 
} from './interfaces/email.interface';

export class SendEmailDto {
  to: string | string[];
  subject: string;
  template: string;
  context?: EmailContext;
}

export class TestEmailDto {
  to?: string;
}

@Controller('emails')
export class EmailsController {
  constructor(private emailsService: EmailsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('send')
  async sendEmail(@Body() dto: SendEmailDto) {
    try {
      const success = await this.emailsService.sendTemplateEmail({
        to: Array.isArray(dto.to) ? dto.to[0] : dto.to,
        subject: dto.subject,
        template: dto.template,
        data: dto.context,
      });
      
      return {
        success,
        message: success ? 'Email sent successfully' : 'Failed to send email',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('preview/:template')
  async previewTemplate(
    @Param('template') template: string,
    @Query('context') contextQuery?: string
  ) {
    try {
      let context: EmailContext = {};
      
      if (contextQuery) {
        try {
          context = JSON.parse(decodeURIComponent(contextQuery));
        } catch (error) {
          throw new BadRequestException('Invalid context JSON');
        }
      }

      // Provide default context for preview
      const defaultContext: EmailContext = {
        recipientName: 'John Doe',
        senderName: 'Demo User',
        proposalTitle: 'Sample Proposal Title',
        proposalUrl: 'https://example.com/proposal/123',
        signUrl: 'https://example.com/proposal/sign/abc123',
        companyName: 'Proposal Management System',
        sentDate: new Date().toLocaleDateString(),
        status: 'Sent',
        testDate: new Date().toISOString(),
        ...context,
      };

      const html = await this.emailsService.renderTemplate(template, defaultContext);
      const preview = { subject: `Preview: ${template}`, html };
      
      return {
        template,
        subject: preview.subject,
        html: preview.html,
        context: defaultContext,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('test')
  async sendTestEmail(@Body() dto: TestEmailDto) {
    try {
      const success = await this.emailsService.sendEmail({
        to: dto.to || 'test@example.com',
        subject: 'Test Email from Proposal Management System',
        html: `
          <h1>🧪 Test Email</h1>
          <p>This is a test email to verify your email configuration.</p>
          <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
          <p>✅ Email delivery successful</p>
        `,
      });
      
      return {
        success,
        message: success 
          ? 'Test email sent successfully' 
          : 'Failed to send test email',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('logs')
  async getEmailLogs(
    @Query('proposalId') proposalId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const filters = {
      proposalId,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    };

    const logs = await this.emailsService.getLogs(filters.proposalId);
    
    return {
      logs,
      total: logs.length,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('templates')
  async getTemplates() {
    const templates = Object.values(EmailTemplateType);
    
    return {
      templates: templates.map(name => ({
        name,
        displayName: name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      })),
    };
  }
}
