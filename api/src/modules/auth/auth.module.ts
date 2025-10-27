import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';
import { PrismaService } from '../../prisma.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'jwt-secret',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshStrategy, PrismaService],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
