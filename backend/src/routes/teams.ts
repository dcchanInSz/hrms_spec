import express, { Request, Response, NextFunction } from 'express';
import { authenticate as authMiddleware } from '../middleware/auth';
import { checkRole as authorize } from '../middleware/role';
import { success } from '../utils/response';
import EmployeeService from '../services/employeeService';
import LeaveService from '../services/leaveService';

const router = express.Router();

// 所有团队路由都需要登录
router.use(authMiddleware);

/**
 * GET /api/teams/dashboard
 * 获取团队仪表盘数据 (经理)
 */
router.get('/dashboard', authorize(['manager', 'hr']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const managerId = (req.user as any).id;

    // 获取团队成员列表
    const teamMembers = await EmployeeService.getTeamMembers(managerId);

    // 获取待审批请假列表
    const pendingApprovals = await LeaveService.getPendingApprovals(managerId);

    success(res, {
      teamSize: teamMembers.length,
      teamMembers,
      pendingApprovals,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/teams/pending-approvals
 * 获取待审批请假列表 (经理)
 */
router.get('/pending-approvals', authorize(['manager', 'hr']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const managerId = (req.user as any).id;
    const pendingApprovals = await LeaveService.getPendingApprovals(managerId);
    success(res, pendingApprovals, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/teams/members
 * 获取团队成员列表
 */
router.get('/members', authorize(['manager', 'hr']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const managerId = (req.user as any).id;
    const teamMembers = await EmployeeService.getTeamMembers(managerId);
    success(res, teamMembers, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/teams/leaves
 * 获取团队成员的请假列表
 */
router.get('/leaves', authorize(['manager', 'hr']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const managerId = (req.user as any).id;
    const leaves = await LeaveService.getTeamLeaves(managerId, req.query);
    success(res, leaves, '获取成功');
  } catch (error) {
    next(error);
  }
});

export default router;
