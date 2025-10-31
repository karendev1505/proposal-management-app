import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { EmailService } from '../services/email.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Emails')
@Controller('emails')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test')
  @ApiOperation({ summary: 'Send test email' })
  async sendTestEmail(
    @Body() body: { email: string; name?: string },
  ) {
    await this.emailService.sendMail({
      to: body.email,
      subject: 'Test Email from Proposal Management System',
      template: 'test',
      context: {
        name: body.name || 'there',
        time: new Date().toLocaleString(),
      },
    });

    return { message: 'Test email sent successfully' };
  }

  @Get('templates/preview')
  @ApiOperation({ summary: 'Preview email template' })
  async previewTemplate(
    @Query('template') templateName: string,
    @Query('name') name?: string,
  ) {
    const html = await this.emailService.previewTemplate(templateName, {
      name: name || 'there',
      time: new Date().toLocaleString(),
    });

    return { html };
  }

  @Get('templates')
  @ApiOperation({ summary: 'List available email templates' })
  getTemplates() {
    return {
      templates: this.emailService.getAvailableTemplates(),
    };
  }
}
