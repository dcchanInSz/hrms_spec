import { Request, Response, NextFunction } from 'express';

/**
 * 审计日志中间件
 */
const auditMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  
  // 排除健康检查等请求
  if (req.path === '/health') {
    return next();
  }

  // 记录请求
  console.log('[Audit]', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: (req as any).user?.id,
    timestamp: new Date().toISOString(),
  });

  next();
};

export { auditMiddleware };
export default { auditMiddleware };
