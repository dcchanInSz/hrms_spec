import express, { Request, Response, NextFunction } from 'express';
import { authenticate as authMiddleware } from '../middleware/auth';
import { success } from '../utils/response';
import PayStubService from '../services/payStubService';

const router = express.Router();

/**
 * GET /api/paystubs
 * 获取我的工资单列表
 */
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paystubs = await PayStubService.getMyPayStubs((req.user as any).id, req.query);
    success(res, paystubs, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/paystubs/latest
 * 获取最新工资单
 */
router.get('/latest', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paystub = await PayStubService.getLatest((req.user as any).id);
    success(res, paystub, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/paystubs/year-summary/:year
 * 获取年度工资汇总
 */
router.get('/year-summary/:year', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = await PayStubService.getYearSummary((req.user as any).id, parseInt(req.params.year));
    success(res, summary, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/paystubs/:id
 * 获取工资单详情
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paystub = await PayStubService.getPayStubById(req.params.id, (req.user as any).id);
    success(res, paystub, '获取成功');
  } catch (error) {
    next(error);
  }
});

export default router;
