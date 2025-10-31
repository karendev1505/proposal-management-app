import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { JwtModule } from '@nestjs/jwt';
import { HealthController } from './health.controller';
import { PrismaService } from '../../prisma.service';
import { EmailsService } from '../emails/emails.service';
import { AuthService } from '../auth/auth.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TerminusModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'jwt-secret',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      },
    }),
    ConfigModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService, EmailsService, AuthService],
})
export class HealthModule {}
