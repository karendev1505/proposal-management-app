import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  HttpHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../../prisma.service';
import { EmailsService } from '../emails/emails.service';
import { AuthService } from '../auth/auth.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prismaService: PrismaService,
    private emailsService: EmailsService,
    private authService: AuthService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.checkPrisma(),
    ]);
  }

  @Get('db')
  @HealthCheck()
  async checkDb() {
    return this.health.check([
      () => this.checkPrisma(),
    ]);
  }

  @Get('test-auth-email')
  @HealthCheck()
  async checkAuthEmail() {
    return this.health.check([
      () => this.checkEmailService(),
      () => this.checkAuthService(),
    ]);
  }

  private async checkPrisma(): Promise<HealthIndicatorResult> {
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      return {
        prisma: {
          status: 'up',
        },
      };
    } catch (error) {
      return {
        prisma: {
          status: 'down',
          error: error.message,
        },
      };
    }
  }

  private async checkEmailService(): Promise<HealthIndicatorResult> {
    try {
      const smtpConfig = await this.emailsService.getSmtpConfig();
      return {
        email: {
          status: 'up',
          details: {
            smtp: smtpConfig ? 'configured' : 'not configured',
            host: smtpConfig?.host || 'not set',
          },
        },
      };
    } catch (error) {
      return {
        email: {
          status: 'down',
          error: error.message,
        },
      };
    }
  }

  private async checkAuthService(): Promise<HealthIndicatorResult> {
    try {
      const jwtConfig = await this.authService.getJwtConfig();
      const hasSecret = !!jwtConfig?.secret;
      const hasExpiration = !!jwtConfig?.expiresIn;
      
      return {
        auth: {
          status: hasSecret && hasExpiration ? 'up' : 'down',
          details: {
            jwt: hasSecret ? 'configured' : 'not configured',
            expiration: hasExpiration ? 'configured' : 'not configured',
          },
        },
      };
    } catch (error) {
      return {
        auth: {
          status: 'down',
          error: error.message,
        },
      };
    }
  }
}
