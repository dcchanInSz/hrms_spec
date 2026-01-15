import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserPayload } from '../types/jwt';

/**
 * 身份验证中间件
 */
const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader: string | undefined = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: '未提供身份验证令牌',
        code: 'MISSING_TOKEN',
      });
      return;
    }

    const token: string = authHeader.substring(7);

    try {
      const decoded: UserPayload | string = jwt.verify(token, (process.env as any).JWT_SECRET || 'your-secret-key') as UserPayload;

      // 确保 decoded 是 UserPayload 类型
      if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
        req.user = decoded as UserPayload;
      } else {
        res.status(401).json({
          error: 'Unauthorized',
          message: '无效的身份验证令牌',
          code: 'INVALID_TOKEN',
        });
        return;
      }

      next();
    } catch (error) {
      res.status(401).json({
        error: 'Unauthorized',
        message: '身份验证令牌无效或已过期',
        code: 'TOKEN_EXPIRED',
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: '身份验证过程中发生错误',
      code: 'AUTH_ERROR',
    });
  }
};

/**
 * 授权中间件工厂函数
 * @param roles - 允许的角色列表
 */
const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: '用户未认证',
        code: 'NOT_AUTHENTICATED',
      });
      return;
    }

    const userRole: string | undefined = (req.user as UserPayload).role;

    if (!roles.includes(userRole)) {
      res.status(403).json({
        error: 'Forbidden',
        message: '用户权限不足',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: userRole,
      });
      return;
    }

    next();
  };
};

/**
 * 可选身份验证中间件（不强制要求认证）
 */
const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader: string | undefined = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token: string = authHeader.substring(7);

      try {
        const decoded: UserPayload | string = jwt.verify(token, (process.env as any).JWT_SECRET || 'your-secret-key') as UserPayload;

        if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
          req.user = decoded as UserPayload;
        }
      } catch (error) {
        // 静默失败，不阻断请求
        console.warn('Optional auth failed:', error);
      }
    }

    next();
  } catch (error) {
    // 静默失败，不阻断请求
    next();
  }
};

export {
  authenticate,
  authorize,
  optionalAuth,
};

export default {
  authenticate,
  authorize,
  optionalAuth,
};
