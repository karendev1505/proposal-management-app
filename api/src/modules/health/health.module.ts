import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { JwtModule } from '@nestjs/jwt';
import { HealthController } from './health.controller';
import { PrismaService } from '../../prisma.service';
import { EmailsModule } from '../emails/emails.module';
import { AuthModule } from '../auth/auth.module';
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
    EmailsModule,
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService],
})
export class HealthModule {}
