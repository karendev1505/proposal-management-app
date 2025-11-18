import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService, JwtPayload } from '../auth.service';
import { PrismaService } from '../../../prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'jwt-secret',
    });
  }

  async validate(payload: JwtPayload) {
    // Return user data from JWT payload
    // Note: activeWorkspaceId should be fetched when needed, not on every request
    // to avoid unnecessary DB queries during token validation
    return {
      userId: payload.sub,
      id: payload.sub, // Alias for compatibility
      email: payload.email,
      name: payload.name,
      role: payload.role,
      activeWorkspaceId: null, // Will be fetched when needed via user service
    };
  }
}
