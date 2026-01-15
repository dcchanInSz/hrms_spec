import express, { Request, Response, NextFunction } from 'express';
import { authenticate as authMiddleware } from '../middleware/auth';
import { success } from '../utils/response';
import LeaveService from '../services/leaveService';

const router = express.Router();

/**
 * GET /api/leaves
 * 获取我的请假列表
 */
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leaves = await LeaveService.getMyLeaves((req.user as any).id, req.query);
    success(res, leaves, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/leaves
 * 创建请假申请
 */
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leave = await LeaveService.createLeave((req.user as any).id, req.body);
    success(res, leave, '申请成功', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaves/:id
 * 获取请假申请详情
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leave = await LeaveService.getLeaveById(req.params.id, (req.user as any).id);
    success(res, leave, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/leaves/:id
 * 撤回请假申请
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leave = await LeaveService.cancelLeave(req.params.id, (req.user as any).id);
    success(res, leave, '撤回成功');
  } catch (error) {
    next(error);
  }
});

export default router;
