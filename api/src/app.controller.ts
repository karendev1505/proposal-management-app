import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Get('health')
  @Public()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: 'connected',
        email: 'configured',
        auth: 'active',
      },
    };
  }

  @Get()
  @Public()
  getRoot() {
    return {
      message: 'Proposal Management API',
      version: '1.0.0',
      documentation: '/api/docs',
      health: '/health',
      endpoints: {
        auth: '/auth',
        emails: '/emails',
        users: '/users',
        proposals: '/proposals',
        templates: '/templates',
        signatures: '/signatures',
        stats: '/stats',
        notifications: '/notifications',
      },
    };
  }
}
