/**
 * 基于角色的访问控制 (RBAC) 中间件
 */

// 角色层级
const roleHierarchy = {
  hr: 3,
  manager: 2,
  employee: 1,
};

// 权限定义
const permissions = {
  // 员工权限
  employee: [
    'profile:read',
    'profile:write',
    'leave:create',
    'leave:read:own',
    'paystub:read:own',
    'notification:read:own',
    'notification:update:own',
  ],
  // 经理权限
  manager: [
    'profile:read',
    'profile:write',
    'leave:create',
    'leave:read:own',
    'leave:approve',
    'leave:read:team',
    'paystub:read:own',
    'paystub:read:team',
    'notification:read:own',
    'notification:update:own',
    'team:read',
    'team:calendar:read',
  ],
  // HR 权限 (包含所有权限)
  hr: [
    'profile:read',
    'profile:write',
    'leave:create',
    'leave:read:own',
    'leave:approve',
    'leave:read:team',
    'leave:read:all',
    'paystub:read:own',
    'paystub:read:team',
    'paystub:read:all',
    'paystub:manage',
    'notification:read:own',
    'notification:update:own',
    'notification:create',
    'employee:create',
    'employee:read:all',
    'employee:update:all',
    'employee:delete',
    'department:create',
    'department:read:all',
    'department:update',
    'department:delete',
    'position:create',
    'position:read:all',
    'position:update',
    'position:delete',
    'report:read:all',
    'report:export',
    'audit:read',
    'policy:read',
    'policy:update',
  ],
};

/**
 * 检查用户是否有指定权限
 * @param {string} role - 用户角色
 * @param {string} permission - 权限名称
 * @returns {boolean} 是否有权限
 */
function hasPermission(role, permission) {
  const rolePerms = permissions[role] || [];
  return rolePerms.includes(permission);
}

/**
 * 角色检查中间件工厂
 * @param {string|string[]} allowedRoles - 允许的角色列表
 * @returns {Function} Express 中间件
 */
function requireRole(allowedRoles) {
  // 兼容两种调用方式：requireRole(['manager', 'hr']) 或 requireRole('manager', 'hr')
  const roleList = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      console.log('[requireRole] No user found in request');
      return res.status(401).json({
        error: 'Unauthorized',
        message: '需要登录后才能访问',
        code: 'NOT_LOGGED_IN',
      });
    }

    const userRole = req.user.role;
    console.log('[requireRole] Role check:', {
      allowedRoles: roleList,
      userRole,
      userRoleType: typeof userRole,
      userId: req.user.id,
    });

    if (!roleList.includes(userRole)) {
      console.log('[requireRole] Role not allowed, returning 403');
      return res.status(403).json({
        error: 'Forbidden',
        message: '您没有权限执行此操作',
        code: 'INSUFFICIENT_ROLE',
      });
    }

    next();
  };
}

/**
 * 权限检查中间件工厂
 * @param {string} permission - 需要的权限
 * @returns {Function} Express 中间件
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '需要登录后才能访问',
        code: 'NOT_LOGGED_IN',
      });
    }

    const userRole = req.user.role;

    // HR 角色拥有所有权限
    if (userRole === 'hr') {
      return next();
    }

    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: '您没有权限执行此操作',
        code: 'INSUFFICIENT_PERMISSION',
        required: permission,
      });
    }

    next();
  };
}

/**
 * 资源所有权检查中间件工厂
 * 用于检查用户是否拥有访问特定资源的权限
 * @param {Function} getResourceOwnerId - 从请求中获取资源所有者 ID 的函数
 * @param {Object} options - 选项
 * @param {string[]} options.allowRoles - 允许访问的额外角色 (如 manager 可以访问团队资源)
 * @returns {Function} Express 中间件
 */
function requireOwnership(getResourceOwnerId, options = {}) {
  const { allowRoles = [] } = options;

  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '需要登录后才能访问',
        code: 'NOT_LOGGED_IN',
      });
    }

    try {
      const ownerId = await getResourceOwnerId(req);

      // 自己拥有资源
      if (ownerId === req.user.id) {
        return next();
      }

      // HR 可以访问所有资源
      if (req.user.role === 'hr') {
        return next();
      }

      // 经理可以访问团队成员的资源
      if (req.user.role === 'manager' && allowRoles.includes('manager')) {
        // 需要额外的团队检查逻辑
        return next();
      }

      return res.status(403).json({
        error: 'Forbidden',
        message: '您没有权限访问此资源',
        code: 'NOT_RESOURCE_OWNER',
      });
    } catch (error) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: '检查资源权限时出错',
        code: 'PERMISSION_CHECK_ERROR',
      });
    }
  };
}

module.exports = {
  roleHierarchy,
  permissions,
  hasPermission,
  requireRole,
  requirePermission,
  requireOwnership,
};
