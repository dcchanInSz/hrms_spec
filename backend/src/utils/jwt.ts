import jwt from 'jsonwebtoken';
import { Request } from 'express';
import { UserPayload } from '../types/jwt';

const JWT_SECRET: string = ((process.env as any).JWT_SECRET || 'your-secret-key') as string;
const JWT_EXPIRES_IN: string = ((process.env as any).JWT_EXPIRES_IN || '7d') as string;

/**
 * 生成 JWT token
 * @param payload - 要编码的数据
 * @returns JWT token
 */
function generateToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

/**
 * 验证 JWT token
 * @param token - JWT token
 * @returns 解码后的数据或 null
 */
function verifyToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
}

/**
 * 从请求头提取 token
 * @param req - Express 请求对象
 * @returns token 字符串或 null
 */
function extractToken(req: Request): string | null {
  const authHeader: string | undefined = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export {
  generateToken,
  verifyToken,
  extractToken,
  JWT_SECRET,
};

export default {
  generateToken,
  verifyToken,
  extractToken,
  JWT_SECRET,
};
