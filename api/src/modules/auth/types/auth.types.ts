import { Role } from '@prisma/client';

export interface AuthResponse {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  isEmailVerified: boolean;
  createdAt: Date;
}

export interface LoginResponse {
  user: AuthResponse;
  accessToken: string;
  refreshToken: string;
}
