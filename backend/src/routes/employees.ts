import express, { Request, Response, NextFunction } from 'express';
import { authenticate as authMiddleware } from '../middleware/auth';
import { success } from '../utils/response';
import EmployeeService from '../services/employeeService';

const router = express.Router();

/**
 * GET /api/employees
 * 获取员工列表 (HR 功能)
 */
router.get('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employees = await EmployeeService.getEmployees(req.query);
    success(res, employees, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/employees/me
 * 获取当前用户信息
 */
router.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await EmployeeService.getProfile((req.user as any).id);
    success(res, employee, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/employees/me
 * 更新个人资料
 */
router.put('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await EmployeeService.updateProfile((req.user as any).id, req.body);
    success(res, employee, '更新成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/employees/:id
 * 获取员工详情
 */
router.get('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await EmployeeService.getEmployeeById(req.params.id);
    success(res, employee, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/employees
 * 创建员工 (HR 功能)
 */
router.post('/', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await EmployeeService.createEmployee(req.body);
    success(res, employee, '创建成功', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/employees/:id
 * 更新员工信息 (HR 功能)
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await EmployeeService.updateEmployee(req.params.id, req.body);
    success(res, employee, '更新成功');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/employees/:id
 * 删除员工 (HR 功能)
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await EmployeeService.deleteEmployee(req.params.id);
    success(res, employee, '删除成功');
  } catch (error) {
    next(error);
  }
});

export default router;
