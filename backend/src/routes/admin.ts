import express, { Request, Response, NextFunction } from 'express';
import { authenticate as authMiddleware } from '../middleware/auth';
import { checkRole as authorize } from '../middleware/role';
import { success } from '../utils/response';
import EmployeeService from '../services/employeeService';
import DepartmentService from '../services/departmentService';
import PositionService from '../services/positionService';
import AuditLogService from '../services/auditLogService';

const router = express.Router();

// 所有 admin 路由都需要 HR 角色
router.use(authMiddleware);
router.use(authorize(['hr']));

/**
 * GET /api/admin/employees
 * 获取所有员工列表
 */
router.get('/employees', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit, department_id, status, role, search } = req.query;
    const result = await EmployeeService.getEmployees({
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 20,
      department_id,
      status,
      role,
      search,
    });

    success(res, result, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/employees
 * 创建新员工
 */
router.post('/employees', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await EmployeeService.createEmployee(req.body);
    success(res, employee, '员工创建成功', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/employees/:id
 * 获取员工详情
 */
router.get('/employees/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await EmployeeService.getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Not Found', message: '员工不存在' });
    }
    success(res, employee);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/employees/:id
 * 更新员工信息
 */
router.put('/employees/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await EmployeeService.updateEmployee(req.params.id, req.body);
    success(res, employee, '更新成功');
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/employees/:id
 * 删除员工
 */
router.delete('/employees/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const employee = await EmployeeService.deleteEmployee(req.params.id);
    success(res, employee, '删除成功');
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/departments
 * 获取所有部门
 */
router.get('/departments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const departments = await DepartmentService.getAllDepartments();
    success(res, departments, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/departments
 * 创建部门
 */
router.post('/departments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const department = await DepartmentService.createDepartment(req.body);
    success(res, department, '创建成功', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/positions
 * 获取所有职位
 */
router.get('/positions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const positions = await PositionService.getAllPositions(req.query);
    success(res, positions, '获取成功');
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/positions
 * 创建职位
 */
router.post('/positions', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const position = await PositionService.createPosition(req.body);
    success(res, position, '创建成功', 201);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/audit-logs
 * 获取审计日志
 */
router.get('/audit-logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const logs = await AuditLogService.getAuditLogs(req.query);
    success(res, logs, '获取成功');
  } catch (error) {
    next(error);
  }
});

export default router;
