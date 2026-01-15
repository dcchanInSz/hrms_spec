const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { success } = require('../utils/response');
const ReportService = require('../services/reportService');

// 所有报表路由都需要登录
router.use(authMiddleware);

/**
 * GET /api/reports/hr-dashboard
 * HR 仪表盘数据
 */
router.get('/hr-dashboard', requireRole('hr'), async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const dashboard = await ReportService.getHRDashboard({
      year: parseInt(year) || new Date().getFullYear(),
      month: month ? parseInt(month) : undefined,
    });
    success(res, dashboard);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports/team-analytics
 * 团队分析数据
 */
router.get('/team-analytics', requireRole(['manager', 'hr']), async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const analytics = await ReportService.getTeamAnalytics(req.user.id, {
      start_date,
      end_date,
    });
    success(res, analytics);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports/headcount
 * 人数统计
 */
router.get('/headcount', requireRole('hr'), async (req, res, next) => {
  try {
    const { department_id, status, date } = req.query;
    const headcount = await ReportService.getHeadcount({
      department_id,
      status,
      date,
    });
    success(res, headcount);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports/leave-utilization
 * 请假利用率
 */
router.get('/leave-utilization', requireRole(['manager', 'hr']), async (req, res, next) => {
  try {
    const { department_id, year, month } = req.query;
    const utilization = await ReportService.getLeaveUtilization({
      department_id,
      year: parseInt(year) || new Date().getFullYear(),
      month: month ? parseInt(month) : undefined,
    });
    success(res, utilization);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/reports/export/:type
 * 导出报表
 */
router.get('/export/:type', requireRole('hr'), async (req, res, next) => {
  try {
    const { type } = req.params;
    const { format, ...params } = req.query;

    const report = await ReportService.exportReport(type, params);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-report.csv`);
      return res.send(report);
    }

    success(res, report);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
