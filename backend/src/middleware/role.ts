import { Request, Response, NextFunction } from 'express';

interface RoleCheckOptions {
  allowSelf?: boolean;
  requireAll?: boolean;
}

const checkRole = (allowedRoles: string[], options: RoleCheckOptions = {}) => {
  const { allowSelf = false, requireAll = false } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;
    
    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: '用户未认证',
        code: 'NOT_AUTHENTICATED',
      });
      return;
    }

    const userRole = user.role;
    
    if (requireAll) {
      const hasAllRoles = allowedRoles.every(role => userRole === role);
      if (!hasAllRoles) {
        res.status(403).json({
          error: 'Forbidden',
          message: '权限不足',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
        return;
      }
    } else {
      const hasRole = allowedRoles.includes(userRole);
      if (!hasRole) {
        res.status(403).json({
          error: 'Forbidden',
          message: '权限不足',
          code: 'INSUFFICIENT_PERMISSIONS',
        });
        return;
      }
    }

    next();
  };
};

export { checkRole };
export default { checkRole };
