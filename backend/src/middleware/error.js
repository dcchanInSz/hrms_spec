/**
 * 错误处理中间件
 */

/**
 * 自定义 API 错误类
 */
class ApiError extends Error {
  constructor(statusCode, message, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 错误
 */
class NotFoundError extends ApiError {
  constructor(message = '资源不存在') {
    super(404, message, 'NOT_FOUND');
  }
}

/**
 * 验证错误
 */
class ValidationError extends ApiError {
  constructor(message, errors = []) {
    super(400, message, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

/**
 * 认证错误
 */
class AuthenticationError extends ApiError {
  constructor(message = '认证失败') {
    super(401, message, 'AUTHENTICATION_ERROR');
  }
}

/**
 * 权限错误
 */
class AuthorizationError extends ApiError {
  constructor(message = '没有权限') {
    super(403, message, 'AUTHORIZATION_ERROR');
  }
}

/**
 * 冲突错误 (如资源已存在)
 */
class ConflictError extends ApiError {
  constructor(message = '资源已存在') {
    super(409, message, 'CONFLICT');
  }
}

/**
 * 错误处理中间件
 */
function errorHandler(err, req, res, next) {
  // 记录错误日志
  console.error('Error:', {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
  });

  // 处理已知的 API 错误
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      ...(err.errors && { errors: err.errors }),
    });
  }

  // 处理 PostgreSQL 错误
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        return res.status(409).json({
          error: '资源已存在',
          code: 'DUPLICATE_ENTRY',
        });
      case '23503': // foreign_key_violation
        return res.status(400).json({
          error: '关联资源不存在',
          code: 'FOREIGN_KEY_ERROR',
        });
      case '23502': // not_null_violation
        return res.status(400).json({
          error: '必填字段缺失',
          code: 'NULL_CONSTRAINT',
        });
    }
  }

  // 处理 JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: '无效的令牌',
      code: 'INVALID_TOKEN',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: '令牌已过期',
      code: 'TOKEN_EXPIRED',
    });
  }

  // 默认返回 500 错误
  const isDevelopment = process.env.NODE_ENV !== 'production';
  res.status(500).json({
    error: isDevelopment ? err.message : '服务器内部错误',
    code: 'INTERNAL_ERROR',
    ...(isDevelopment && { stack: err.stack }),
  });
}

/**
 * 404 处理器
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
}

module.exports = {
  ApiError,
  NotFoundError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  errorHandler,
  notFoundHandler,
};
