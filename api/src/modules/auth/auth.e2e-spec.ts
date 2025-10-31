import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    rotateRefreshToken: jest.fn(),
    revokeAllUserTokens: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    authService = moduleRef.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const expectedResponse = {
        id: '1',
        email: registerDto.email,
        name: registerDto.name,
        role: 'USER',
        isEmailVerified: false,
        createdAt: new Date().toISOString(),
      };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(expectedResponse);
        });
    });
  });

  describe('POST /auth/login', () => {
    it('should login successfully', () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResponse = {
        accessToken: 'jwt-token',
        refreshToken: 'refresh-token',
        user: {
          id: '1',
          email: 'test@example.com',
          role: 'USER',
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(expectedResponse);
        });
    });
  });
});
