import { Test, TestingModule } from '@nestjs/testing';
import { AuthService, AuthResponse } from './auth.service';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn().mockResolvedValue('mock-token'),
    sign: jest.fn().mockReturnValue('mock-token'),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      const config = {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRATION_TIME: '15m',
        JWT_REFRESH_SECRET: 'test-refresh-secret',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should successfully register a new user', async () => {
      const hashedPassword = 'hashedPassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: '1',
        email: registerDto.email,
        name: registerDto.name,
        role: 'USER',
        isEmailVerified: false,
        createdAt: new Date(),
      });

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result).toEqual<AuthResponse>({
        accessToken: 'mock-token',
        refreshToken: 'mock-token',
        user: {
          id: '1',
          email: registerDto.email,
          name: registerDto.name,
          role: 'USER'
        }
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: registerDto.email,
          name: registerDto.name,
          password: hashedPassword,
        },
      });
    });
  });
});
