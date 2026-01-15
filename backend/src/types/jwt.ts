// src/types/jwt.ts

export interface UserPayload {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  departmentId?: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface JWTConfig {
  secret: string;
  expiresIn: string | number;
  algorithm?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
