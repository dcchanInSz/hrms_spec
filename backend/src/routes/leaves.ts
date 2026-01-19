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
 * GET /api/leaves/types
 * 获取请假类型列表
 */
router.get('/types', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const types = await LeaveService.getLeaveTypes();
    success(res, types, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaves/balances
 * 获取请假余额
 */
router.get('/balances', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employeeId = (req.user as any).id;
    const balances = await LeaveService.getBalance(employeeId);
    success(res, balances, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/leaves/policies
 * 获取请假政策
 */
router.get('/policies', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const policies = await LeaveService.getPolicies();
    success(res, policies, '获取成功');
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

/**
 * PUT /api/leaves/:id/cancel
 * 取消请假申请 (PUT版本，用于兼容前端)
 */
router.put('/:id/cancel', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leave = await LeaveService.cancelLeave(req.params.id, (req.user as any).id);
    success(res, leave, '取消成功');
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/leaves/:id/approve
 * 审批请假申请 (经理/HR)
 */
router.put('/:id/approve', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const leave = await LeaveService.approveLeave(req.params.id, (req.user as any).id);
    success(res, leave, '审批成功');
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/leaves/:id/reject
 * 拒绝请假申请 (经理/HR)
 */
router.put('/:id/reject', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({
        error: 'Bad Request',
        message: '拒绝原因不能为空',
        code: 'MISSING_REASON',
      });
    }
    const leave = await LeaveService.rejectLeave(req.params.id, (req.user as any).id, reason);
    success(res, leave, '已拒绝申请');
  } catch (error) {
    next(error);
  }
});

export default router;
