const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { success } = require('../utils/response');
const EmployeeService = require('../services/employeeService');

/**
 * GET /api/employees/me
 * 获取当前用户的个人资料 (简化的 profile)
 */
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const profile = await EmployeeService.getProfile(req.user.id);
    success(res, profile);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/employees/me
 * 更新当前用户的个人资料
 */
router.put('/me', authMiddleware, async (req, res, next) => {
  try {
    const { phone, emergency_contact, emergency_phone } = req.body;

    const updated = await EmployeeService.updateProfile(req.user.id, {
      phone,
      emergency_contact,
      emergency_phone,
    });

    success(res, updated, '个人资料更新成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/employees/balance
 * 获取当前用户的请假余额
 */
router.get('/balance', authMiddleware, async (req, res, next) => {
  try {
    const { requirePermission } = require('../middleware/role');

    const LeaveService = require('../services/leaveService');
    const balances = await LeaveService.getBalances(req.user.id);

    success(res, balances);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/employees/team
 * 获取当前用户的团队成员 (经理功能)
 */
router.get('/team', authMiddleware, async (req, res, next) => {
  try {
    const { requirePermission } = require('../middleware/role');
    const { roleHierarchy } = require('../middleware/role');

    // 检查权限 - 经理或HR
    if (req.user.role !== 'manager' && req.user.role !== 'hr') {
      return res.status(403).json({
        error: 'Forbidden',
        message: '您没有权限查看团队',
        code: 'INSUFFICIENT_ROLE',
      });
    }

    const teamMembers = await EmployeeService.getTeamMembers(req.user.id);
    success(res, teamMembers);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
