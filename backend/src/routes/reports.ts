import express, { Request, Response, NextFunction } from 'express';
import { authenticate as authMiddleware } from '../middleware/auth';
import { checkRole as authorize } from '../middleware/role';
import { success } from '../utils/response';
import ReportService from '../services/reportService';

const router = express.Router();

// 所有报表路由都需要登录
router.use(authMiddleware);

/**
 * GET /api/reports/hr-dashboard
 * HR 仪表盘数据
 */
router.get('/hr-dashboard', authorize(['hr']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { year, month } = req.query;
    const dashboard = await ReportService.getHRDashboard({
      year: parseInt(year as string) || new Date().getFullYear(),
      month: month ? parseInt(month as string) : undefined,
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
router.get('/team-analytics', authorize(['manager', 'hr']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { start_date, end_date } = req.query;
    const analytics = await ReportService.getTeamAnalytics((req.user as any).id, {
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
router.get('/headcount', authorize(['hr']), async (req: Request, res: Response, next: NextFunction) => {
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
router.get('/leave-utilization', authorize(['manager', 'hr']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { department_id, year, month } = req.query;
    const utilization = await ReportService.getLeaveUtilization({
      department_id,
      year: parseInt(year as string) || new Date().getFullYear(),
      month: month ? parseInt(month as string) : undefined,
    });
    success(res, utilization);
  } catch (error) {
    next(error);
  }
});

export default router;
