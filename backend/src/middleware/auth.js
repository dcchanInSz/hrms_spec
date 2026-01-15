const { verifyToken, extractToken } = require('../utils/jwt');

/**
 * JWT 认证中间件
 * 验证请求中的 JWT token，并将用户信息附加到 req.user
 */
function authMiddleware(req, res, next) {
  console.log('[authMiddleware] Checking auth for:', req.method, req.path);
  const token = extractToken(req);
  console.log('[authMiddleware] Token found:', !!token, 'Prefix:', req.headers.authorization?.substring(0, 20));

  if (!token) {
    console.log('[authMiddleware] No token, returning 401');
    return res.status(401).json({
      error: 'Unauthorized',
      message: '未提供认证令牌',
      code: 'NO_TOKEN',
    });
  }

  const decoded = verifyToken(token);
  console.log('[authMiddleware] Decoded token:', decoded ? 'success' : 'failed');

  if (!decoded) {
    console.log('[authMiddleware] Invalid token, returning 401');
    return res.status(401).json({
      error: 'Unauthorized',
      message: '无效或已过期的令牌',
      code: 'INVALID_TOKEN',
    });
  }

  // 将用户信息附加到请求对象
  req.user = {
    id: decoded.id,
    employeeNo: decoded.employee_no,
    email: decoded.email,
    role: decoded.role,
    departmentId: decoded.department_id,
  };
  console.log('[authMiddleware] User set:', req.user);

  next();
}

/**
 * 可选认证中间件
 * 如果提供了 token 则验证并附加用户信息，否则继续
 */
function optionalAuth(req, res, next) {
  const token = extractToken(req);

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = {
        id: decoded.id,
        employeeNo: decoded.employee_no,
        email: decoded.email,
        role: decoded.role,
        departmentId: decoded.department_id,
      };
    }
  }

  next();
}

module.exports = {
  authMiddleware,
  optionalAuth,
};
