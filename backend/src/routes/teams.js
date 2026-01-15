const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { success } = require('../utils/response');
const EmployeeService = require('../services/employeeService');
const LeaveService = require('../services/leaveService');
const ReportService = require('../services/reportService');

// 所有团队路由都需要登录且为经理或HR角色
router.use(authMiddleware);

/**
 * GET /api/teams/dashboard
 * 获取团队仪表盘数据 (经理)
 */
router.get('/dashboard', requireRole(['manager', 'hr']), async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const managerId = req.user.id;

    // 获取团队成员列表
    const teamMembers = await EmployeeService.getTeamMembers(managerId);

    // 获取待审批请假列表
    const pendingApprovals = await LeaveService.getPendingApprovals(managerId);

    // 获取团队分析数据
    const analytics = await ReportService.getTeamAnalytics(managerId, {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    });

    // 获取本月请假统计
    const currentYear = parseInt(year) || new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    // 团队请假统计
    const leaveStats = await require('../models/db').query(
      `SELECT
        COUNT(*) FILTER (WHERE lr.status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE lr.status = 'approved') as approved_count,
        COUNT(*) FILTER (WHERE lr.status = 'rejected') as rejected_count,
        SUM(lr.days) FILTER (WHERE lr.status = 'approved') as approved_days
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       WHERE e.manager_id = $1
         AND EXTRACT(YEAR FROM lr.start_date) = $2
         AND EXTRACT(MONTH FROM lr.start_date) = $3`,
      [managerId, currentYear, currentMonth]
    );

    // 今日请假人员
    const todayLeaves = await require('../models/db').query(
      `SELECT lr.*, e.name as employee_name, e.avatar_url
       FROM leave_requests lr
       JOIN employees e ON lr.employee_id = e.id
       WHERE e.manager_id = $1
         AND lr.status = 'approved'
         AND CURRENT_DATE BETWEEN lr.start_date AND lr.end_date
       ORDER BY lr.start_date`,
      [managerId]
    );

    success(res, {
      teamSize: analytics.teamSize,
      teamMembers: teamMembers,
      pendingApprovals: pendingApprovals,
      leaveStats: leaveStats.rows[0] || {
        pending_count: 0,
        approved_count: 0,
        rejected_count: 0,
        approved_days: 0,
      },
      todayLeaves: todayLeaves.rows,
      analytics: analytics.leaveStats,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/teams/members
 * 获取团队成员列表 (经理)
 */
router.get('/members', requireRole(['manager', 'hr']), async (req, res, next) => {
  try {
    const { include_inactive } = req.query;
    const managerId = req.user.id;

    // 获取团队成员
    const teamMembers = await EmployeeService.getTeamMembers(managerId);

    // 如果需要包含非活跃成员，从数据库直接查询
    let allMembers = teamMembers;
    if (include_inactive === 'true') {
      const { query } = require('../models/db');
      const result = await query(
        `SELECT e.*, d.name as department_name, p.title as position_title
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN positions p ON e.position_id = p.id
         WHERE e.manager_id = $1
         ORDER BY e.name`,
        [managerId]
      );
      allMembers = result.rows;
    }

    // 为每个成员获取请假统计
    const membersWithLeaveStats = await Promise.all(
      allMembers.map(async (member) => {
        const { query } = require('../models/db');
        const leaveStats = await query(
          `SELECT
            COUNT(*) FILTER (WHERE lr.status = 'pending') as pending_leaves,
            COUNT(*) FILTER (WHERE lr.status = 'approved') as approved_leaves,
            SUM(lr.days) FILTER (WHERE lr.status = 'approved') as used_days,
            COUNT(*) FILTER (WHERE lr.status = 'rejected') as rejected_leaves
           FROM leave_requests lr
           WHERE lr.employee_id = $1
           AND EXTRACT(YEAR FROM lr.start_date) = $2`,
          [member.id, new Date().getFullYear()]
        );
        return {
          ...member,
          leaveStats: leaveStats.rows[0] || {
            pending_leaves: 0,
            approved_leaves: 0,
            used_days: 0,
            rejected_leaves: 0,
          },
        };
      })
    );

    success(res, membersWithLeaveStats);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/teams/leave-requests
 * 获取团队请假申请列表 (经理)
 */
router.get('/leave-requests', requireRole(['manager', 'hr']), async (req, res, next) => {
  try {
    const { status, start_date, end_date, page = 1, limit = 20 } = req.query;

    const result = await LeaveService.getTeamLeaves(req.user.id, {
      status,
      start_date,
      end_date,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/teams/calendar
 * 获取团队日历数据 (经理)
 */
router.get('/calendar', requireRole(['manager', 'hr']), async (req, res, next) => {
  try {
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
 * GET /api/teams/pending-approvals
 * 获取待审批列表 (经理)
 */
router.get('/pending-approvals', requireRole(['manager', 'hr']), async (req, res, next) => {
  try {
    const pendingApprovals = await LeaveService.getPendingApprovals(req.user.id);
    success(res, pendingApprovals);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
