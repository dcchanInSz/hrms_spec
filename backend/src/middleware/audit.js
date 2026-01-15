const { query } = require('../models/db');

/**
 * 审计日志中间件
 * 记录所有 API 请求的操作到 audit_logs 表
 */

const IGNORED_PATHS = ['/health', '/api/auth/login', '/api/auth/refresh'];

/**
 * 检查路径是否应该忽略
 */
function shouldIgnore(path) {
  return IGNORED_PATHS.some(ignored => path.startsWith(ignored));
}

/**
 * 获取操作类型
 */
function getAction(method, path) {
  if (path.startsWith('/api/auth')) return 'auth';
  if (path.startsWith('/api/employees')) {
    if (method === 'POST') return 'employee:create';
    if (method === 'PUT' || method === 'PATCH') return 'employee:update';
    if (method === 'DELETE') return 'employee:delete';
    return 'employee:read';
  }
  if (path.startsWith('/api/leaves')) {
    if (method === 'POST') return 'leave:create';
    if (method === 'PUT') {
      if (path.includes('approve')) return 'leave:approve';
      if (path.includes('reject')) return 'leave:reject';
      return 'leave:update';
    }
    if (method === 'DELETE') return 'leave:delete';
    return 'leave:read';
  }
  if (path.startsWith('/api/paystubs')) {
    if (method === 'POST') return 'paystub:create';
    if (method === 'DELETE') return 'paystub:delete';
    return 'paystub:read';
  }
  if (path.startsWith('/api/admin')) {
    if (path.includes('employees')) {
      if (method === 'POST') return 'admin:employee:create';
      if (method === 'PUT' || method === 'PATCH') return 'admin:employee:update';
      if (method === 'DELETE') return 'admin:employee:delete';
    }
    if (path.includes('departments')) return 'admin:department:manage';
    if (path.includes('audit')) return 'admin:audit:read';
    return 'admin:action';
  }
  if (path.startsWith('/api/reports')) return 'report:read';
  return 'api:access';
}

/**
 * 审计日志中间件
 */
async function auditMiddleware(req, res, next) {
  // 跳过不需要记录的请求
  if (shouldIgnore(req.path)) {
    return next();
  }

  // 保存原始 send 方法
  const originalSend = res.send;
  const startTime = Date.now();

  // 监听响应完成
  res.send = function(body) {
    // 计算响应时间
    const duration = Date.now() - startTime;

    // 异步记录审计日志
    recordAuditLog(req, res, body, duration);

    return originalSend.call(this, body);
  };

  next();
}

/**
 * 记录审计日志
 */
async function recordAuditLog(req, res, body, duration) {
  try {
    // 解析请求体 (如果有)
    const requestData = req.body && Object.keys(req.body).length > 0 ? req.body : null;

    // 解析响应体 (如果是成功响应)
    let responseData = null;
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        responseData = typeof body === 'string' ? JSON.parse(body) : body;
        responseData = responseData?.data || null;
      } catch (e) {
        // 忽略解析错误
      }
    }

    // 获取操作名称
    const action = getAction(req.method, req.path);

    await query(
      `INSERT INTO audit_logs
       (user_id, action, entity_type, entity_id, old_value, new_value, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        req.user?.id || null,
        action,
        extractEntityType(req.path),
        extractEntityId(req.path) || null,
        JSON.stringify(requestData),
        JSON.stringify(responseData),
        req.ip || req.connection?.remoteAddress,
        req.headers['user-agent'],
      ]
    );
  } catch (error) {
    // 审计日志记录失败不应影响正常请求
    console.error('Failed to record audit log:', error);
  }
}

/**
 * 从路径提取实体类型
 */
function extractEntityType(path) {
  const parts = path.split('/').filter(Boolean);
  if (parts.length >= 2) {
    return parts[1]; // 如 'employees', 'leaves', 'paystubs'
  }
  return 'unknown';
}

/**
 * 从路径提取实体 ID
 */
function extractEntityId(path) {
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  const match = path.match(uuidRegex);
  return match ? match[0] : null;
}

module.exports = {
  auditMiddleware,
};
