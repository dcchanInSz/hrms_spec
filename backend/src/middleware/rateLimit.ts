import { Request, Response, NextFunction } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }>;

  constructor() {
    this.requests = new Map();
  }

  middleware(options: RateLimitOptions) {
    const { windowMs, max, message = 'Too many requests' } = options;

    return (req: Request, res: Response, next: NextFunction): void => {
      const ip = (req as any).ip || (req as any).connection?.remoteAddress || 'unknown';
      const now = Date.now();
      const window = now - windowMs;

      const record = this.requests.get(ip);

      if (!record || record.resetTime < window) {
        this.requests.set(ip, { count: 1, resetTime: now });
        return next();
      }

      if (record.count >= max) {
        res.status(429).json({
          error: 'Too Many Requests',
          message,
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        });
        return;
      }

      record.count++;
      next();
    };
  }
}

const apiLimiter = new RateLimiter();
const loginLimiter = new RateLimiter();

export const rateLimiters = {
  api: {
    middleware: apiLimiter.middleware({
      windowMs: 15 * 60 * 1000,
      max: 300, // 开发环境临时提高限制
    }),
  },
  login: {
    middleware: loginLimiter.middleware({
      windowMs: 15 * 60 * 1000,
      max: 20, // 开发环境临时提高限制
    }),
  },
};

export default { rateLimiters };
