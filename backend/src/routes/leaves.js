const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { success, paginated, created } = require('../utils/response');
const LeaveService = require('../services/leaveService');
const LeavePolicyModel = require('../models/LeavePolicy');
const LeaveBalanceModel = require('../models/LeaveBalance');
const { requireRole } = require('../middleware/role');

/**
 * GET /api/leaves
 * 获取我的请假列表
 */
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { status, leave_type, year, page, limit } = req.query;

    const result = await LeaveService.getMyLeaves(req.user.id, {
      status,
      leave_type,
      year: year ? parseInt(year) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });

    paginated(res, result.data, {
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/leaves
 * 创建请假申请
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { leave_type, start_date, end_date, days, reason } = req.body;

    // 验证必填字段
    if (!leave_type || !start_date || !end_date || !days) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '缺少必填字段：leave_type, start_date, end_date, days',
        code: 'MISSING_FIELDS',
      });
    }

    // 计算实际天数 (如果未提供)
    const calculatedDays = days || LeaveService.calculateDays(start_date, end_date);

    const leave = await LeaveService.createLeave(req.user.id, {
      leave_type,
      start_date,
      end_date,
      days: calculatedDays,
      reason,
    });

    created(res, leave, '请假申请已提交');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaves/types
 * 获取请假类型列表
 */
router.get('/types', authMiddleware, (req, res) => {
  success(res, LeaveService.getLeaveTypes());
});

/**
 * GET /api/leaves/balances
 * 获取我的请假余额
 */
router.get('/balances', authMiddleware, async (req, res, next) => {
  try {
    const balances = await LeaveService.getBalances(req.user.id);
    success(res, balances);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaves/pending
 * 获取待审批列表 (经理/HR)
 */
router.get('/pending', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'hr') {
      return res.status(403).json({
        error: 'Forbidden',
        message: '您没有审批权限',
        code: 'INSUFFICIENT_ROLE',
      });
    }

    const pending = await LeaveService.getPendingApprovals(req.user.id);
    success(res, pending);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaves/team
 * 获取团队请假列表 (经理)
 */
router.get('/team', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'hr') {
      return res.status(403).json({
        error: 'Forbidden',
        message: '您没有权限查看团队请假',
        code: 'INSUFFICIENT_ROLE',
      });
    }

    const { status, start_date, end_date, page, limit } = req.query;

    const result = await LeaveService.getTeamLeaves(req.user.id, {
      status,
      start_date,
      end_date,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    });

    paginated(res, result.data, {
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaves/calendar
 * 获取团队日历 (经理)
 */
router.get('/calendar', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'hr') {
      return res.status(403).json({
        error: 'Forbidden',
        message: '您没有权限查看团队日历',
        code: 'INSUFFICIENT_ROLE',
      });
    }

    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '请提供 start_date 和 end_date',
        code: 'MISSING_DATES',
      });
    }

    const events = await LeaveService.getTeamCalendar(req.user.id, start_date, end_date);
    success(res, events);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaves/policies
 * 获取请假政策列表
 */
router.get('/policies', authMiddleware, async (_req, res, next) => {
  try {
    const policies = await LeavePolicyModel.findAll();
    success(res, policies);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaves/:id
 * 获取请假详情
 */
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const leave = await LeaveService.getLeaveById(req.params.id, req.user.id);
    success(res, leave);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/leaves/:id/cancel
 * 撤回请假申请
 */
router.put('/:id/cancel', authMiddleware, async (req, res, next) => {
  try {
    const leave = await LeaveService.cancelLeave(req.params.id, req.user.id);
    if (!leave) {
      return res.status(404).json({
        error: 'Not Found',
        message: '请假申请不存在或无法撤回',
        code: 'NOT_FOUND',
      });
    }
    success(res, leave, '已撤回请假申请');
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/leaves/:id/approve
 * 审批通过
 */
router.put('/:id/approve', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'hr') {
      return res.status(403).json({
        error: 'Forbidden',
        message: '您没有审批权限',
        code: 'INSUFFICIENT_ROLE',
      });
    }

    const leave = await LeaveService.approveLeave(req.params.id, req.user.id);
    if (!leave) {
      return res.status(404).json({
        error: 'Not Found',
        message: '请假申请不存在或已审批',
        code: 'NOT_FOUND',
      });
    }

    success(res, leave, '审批通过');
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/leaves/:id/reject
 * 审批拒绝
 */
router.put('/:id/reject', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'manager' && req.user.role !== 'hr') {
      return res.status(403).json({
        error: 'Forbidden',
        message: '您没有审批权限',
        code: 'INSUFFICIENT_ROLE',
      });
    }

    const { reason } = req.body;
    const leave = await LeaveService.rejectLeave(req.params.id, req.user.id, reason);
    if (!leave) {
      return res.status(404).json({
        error: 'Not Found',
        message: '请假申请不存在或已审批',
        code: 'NOT_FOUND',
      });
    }

    success(res, leave, '已拒绝申请');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaves/policies
 * 获取请假政策列表
 */
router.get('/policies', authMiddleware, async (req, res, next) => {
  try {
    const policies = await LeavePolicyModel.findAll();
    success(res, policies);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/leaves/year-end-rollover
 * 年度结转 (HR 专用)
 * 将员工的未使用假期结转到下一年
 */
router.post('/year-end-rollover', authMiddleware, async (req, res, next) => {
  try {
    // 验证 HR 权限
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        error: 'Forbidden',
        message: '只有 HR 可以执行年度结转',
        code: 'INSUFFICIENT_ROLE',
      });
    }

    const { employee_id, leave_type, carryover_days, target_year } = req.body;

    if (!employee_id || !leave_type || carryover_days === undefined || !target_year) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '缺少必填字段：employee_id, leave_type, carryover_days, target_year',
        code: 'MISSING_FIELDS',
      });
    }

    // 验证结转天数不超过上限
    const policy = await LeavePolicyModel.findByType(leave_type);
    if (policy && carryover_days > parseFloat(policy.max_carryover || 0)) {
      return res.status(400).json({
        error: 'Bad Request',
        message: `结转天数超过上限 ${policy.max_carryover} 天`,
        code: 'EXCEEDS_LIMIT',
      });
    }

    // 获取当年余额记录
    const currentYear = target_year - 1;
    const currentBalance = await LeaveBalanceModel.findByEmployeeTypeYear(
      employee_id,
      leave_type,
      currentYear
    );

    if (!currentBalance) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '未找到当年的余额记录',
        code: 'NO_BALANCE_RECORD',
      });
    }

    // 创建新的年度余额记录
    const newBalance = await LeaveBalanceModel.create({
      employee_id,
      leave_type,
      year: target_year,
      total_days: 0, // 下一年额度由政策决定
      carryover_days: carryover_days,
    });

    // 更新当年余额，标记已结转
    await LeaveBalanceModel.setCarryoverDays(employee_id, leave_type, currentYear, 0);

    success(res, newBalance, '年度结转成功');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/leaves/year-end-rollover/bulk
 * 批量年度结转 (HR 专用)
 * 为所有员工自动结转
 */
router.post('/year-end-rollover/bulk', authMiddleware, async (req, res, next) => {
  try {
    // 验证 HR 权限
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        error: 'Forbidden',
        message: '只有 HR 可以执行年度结转',
        code: 'INSUFFICIENT_ROLE',
      });
    }

    const { target_year } = req.body;

    if (!target_year) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '请指定目标年度',
        code: 'MISSING_YEAR',
      });
    }

    // 这里应该调用批量结转服务
    // 简化版本返回提示信息
    success(res, {
      message: '批量年度结转功能需要配合员工服务使用',
      target_year,
      note: '请联系系统管理员完成批量结转',
    }, '批量结转接口就绪');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
